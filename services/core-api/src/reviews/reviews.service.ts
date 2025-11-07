import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  status?: string;
}

export interface ReviewDecisionDto {
  decision: 'approved' | 'denied' | 'needs_more_info';
  notes?: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private settingsHelper: PlatformSettingsHelper,
  ) {}

  async getPendingReviews(query: PaginationQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      decision: 'pending'
    };

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.kycReview.findMany({
        where,
        include: {
          broker: {
            include: {
              user: true
            }
          },
          reviewer: true
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: limit
      }),
      this.prisma.kycReview.count({ where })
    ]);

    return {
      reviews: reviews.map((review: any) => ({
        id: review.id,
        brokerId: review.brokerId,
        broker: {
          id: review.broker.id,
          licenseNumber: review.broker.licenseNumber,
          licenseDocs: review.broker.licenseDocs,
          submittedAt: review.broker.submittedAt,
          user: {
            id: review.broker.user.id,
            role: review.broker.user.role,
            emailHash: review.broker.user.emailHash
          }
        },
        decision: review.decision,
        notes: review.notes,
        createdAt: review.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async makeReviewDecision(reviewId: string, dto: ReviewDecisionDto) {
    const review = await this.prisma.kycReview.update({
      where: { id: reviewId },
      data: {
        decision: dto.decision as any,
        notes: dto.notes,
        decidedAt: new Date()
      },
      include: {
        broker: {
          include: {
            user: true
          }
        }
      }
    });

    // Update broker status based on decision
    if (dto.decision === 'approved') {
      // Validate license number pattern if pattern is configured (with tenant overrides)
      const settings = await this.settingsHelper.getEffectiveSettings();
      const licensePattern = settings.tenancy?.license?.pattern;
      if (licensePattern) {
        const patternRegex = new RegExp(licensePattern);
        if (!patternRegex.test(review.broker.licenseNumber)) {
          throw new BadRequestException(
            `License number "${review.broker.licenseNumber}" does not match required pattern: ${licensePattern}`
          );
        }
      }

      await this.prisma.broker.update({
        where: { id: review.brokerId },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
      });

      // Create license with expiry based on settings
      const defaultExpiryMonths = settings.tenancy?.license?.defaultExpiryMonths ?? 12;
      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt);
      expiresAt.setMonth(expiresAt.getMonth() + defaultExpiryMonths);

      await this.prisma.license.create({
        data: {
          tenantId: review.broker.tenantId,
          brokerUserId: review.broker.userId,
          licenseNo: review.broker.licenseNumber,
          issuedAt,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Generate QR code
      await this.generateQrCode(review.brokerId, review.broker.tenantId);
    } else if (dto.decision === 'denied') {
      await this.prisma.broker.update({
        where: { id: review.brokerId },
        data: {
          status: 'draft' // Reset to draft for resubmission
        }
      });
    }

    return {
      success: true,
      decision: dto.decision,
      message: `Review ${dto.decision === 'approved' ? 'approved - QR code generated' : 'completed'}`,
      reviewId: review.id
    };
  }

  private async generateQrCode(brokerId: string, tenantId: string) {
    const qrCode = await this.prisma.qrCode.create({
      data: {
        tenantId,
        code: brokerId,
        qrSvgUrl: `/qr-codes/${brokerId}.svg`,
        status: 'active',
        metadata: {
          brokerId,
        },
      },
    });

    // Link QR code to broker
    await this.prisma.broker.update({
      where: { id: brokerId },
      data: { qrCodeId: qrCode.id }
    });

    return qrCode;
  }

  async getReviewById(id: string) {
    const review = await this.prisma.kycReview.findUnique({
      where: { id },
      include: {
        broker: {
          include: {
            user: true,
          },
        },
        reviewer: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review ${id} not found`);
    }

    return {
      id: review.id,
      decision: review.decision,
      notes: review.notes,
      createdAt: review.createdAt,
      decidedAt: review.decidedAt,
      broker: review.broker
        ? {
            id: review.broker.id,
            licenseNumber: review.broker.licenseNumber,
            status: review.broker.status,
            licenseDocs: review.broker.licenseDocs,
            user: {
              id: review.broker.user.id,
              email: review.broker.user.email,
              role: review.broker.user.role,
            },
          }
        : null,
      reviewer: review.reviewer
        ? {
            id: review.reviewer.id,
            email: review.reviewer.email,
            role: review.reviewer.role,
          }
        : null,
    };
  }
}
