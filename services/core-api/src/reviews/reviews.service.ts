import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private prisma: PrismaService) {}

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
        broker: true
      }
    });

    // Update broker status based on decision
    if (dto.decision === 'approved') {
      await this.prisma.broker.update({
        where: { id: review.brokerId },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
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
        tenantId: tenantId,
        brokerId: brokerId,
        qrSvgUrl: `/qr-codes/${brokerId}.svg`,
        status: 'active'
      }
    });

    // Link QR code to broker
    await this.prisma.broker.update({
      where: { id: brokerId },
      data: { qrCodeId: qrCode.id }
    });

    return qrCode;
  }
}