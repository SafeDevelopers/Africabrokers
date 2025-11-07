import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getDashboardOverview() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required for dashboard metrics');
    }

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [
      pendingBrokers,
      activeBrokers,
      totalListings,
      pendingReviews,
      activeUsers,
      paidInvoicesThisMonth,
      monthlyRevenueAggregate,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.broker.count({
        where: { tenantId, status: 'submitted' },
      }),
      this.prisma.broker.count({
        where: { tenantId, status: 'approved' },
      }),
      this.prisma.listing.count({
        where: { tenantId },
      }),
      this.prisma.kycReview.count({
        where: { tenantId, decision: 'pending' },
      }),
      this.prisma.user.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.invoice.count({
        where: {
          tenantId,
          status: 'paid',
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'paid',
          createdAt: { gte: startOfMonth },
        },
        _sum: { paidAmount: true },
      }),
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: {
          actor: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const normalizeDecimal = (value: unknown): number => {
      if (value == null) {
        return 0;
      }
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        return Number(value);
      }
      if (typeof value === 'object' && value !== null) {
        const decimal = value as { toNumber?: () => number };
        if (typeof decimal.toNumber === 'function') {
          return decimal.toNumber();
        }
      }
      return Number(value);
    };

    const monthlyRevenue = normalizeDecimal(monthlyRevenueAggregate._sum.paidAmount);

    type AuditLogWithActor = (typeof recentAuditLogs)[number];

    return {
      generatedAt: new Date().toISOString(),
      stats: {
        pendingBrokers,
        activeBrokers,
        totalListings,
        pendingReviews,
        monthlyRevenue,
        activeUsers,
        completedTransactions: paidInvoicesThisMonth,
        averageResponseTime: null,
      },
      recentActivity: recentAuditLogs.map((log: AuditLogWithActor) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        createdAt: log.createdAt.toISOString(),
        actor: log.actor
          ? {
              id: log.actor.id,
              email: log.actor.email,
              role: log.actor.role,
            }
          : null,
        summary: `${log.action} on ${log.entityType}`,
      })),
    };
  }

  async getQRCodes(limit: number = 60) {
    const qrCodes = await this.prisma.qrCode.findMany({
      take: limit,
      include: {
        broker: {
          include: {
            user: true,
            tenant: true,
          },
        },
        tenant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    type QrWithRelations = (typeof qrCodes)[number];

    // Map to the format expected by the frontend
    return {
      items: qrCodes.map((qr: QrWithRelations) => ({
        id: qr.id,
        tenantId: qr.tenantId,
        code: qr.id, // Use ID as code for now (you might want a separate code field)
        status: qr.status === 'active' ? 'ACTIVE' : 'REVOKED',
        createdAt: qr.createdAt.toISOString(),
        lastScanned: null, // TODO: Add scan tracking if needed
        scanCount: 0, // TODO: Add scan count tracking
        subjectType: qr.broker ? ('BROKER' as const) : ('LISTING' as const),
        subject: qr.broker
          ? {
              id: qr.broker.id,
              licenseNumber: qr.broker.licenseNumber,
              licenseDocs: qr.broker.licenseDocs as any,
              title: (qr.broker.licenseDocs as any)?.businessName,
              rating: qr.broker.rating,
              status: qr.broker.status,
            }
          : undefined,
      })),
      total: qrCodes.length,
    };
  }

  async getQRCodeById(id: string) {
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { id },
      include: {
        broker: {
          include: {
            user: true,
            tenant: true,
          },
        },
        tenant: true,
      },
    });

    if (!qrCode) {
      throw new NotFoundException(`QR code with ID ${id} not found`);
    }

    return {
      id: qrCode.id,
      tenantId: qrCode.tenantId,
      code: qrCode.id,
      subjectType: qrCode.broker ? ('BROKER' as const) : ('LISTING' as const),
      subjectId: qrCode.broker?.id || '',
      createdAt: qrCode.createdAt.toISOString(),
      revokedAt: qrCode.status !== 'active' ? qrCode.updatedAt.toISOString() : null,
      status: qrCode.status === 'active' ? ('ACTIVE' as const) : ('REVOKED' as const),
      metaJson: {},
      subject: qrCode.broker
        ? {
            name: (qrCode.broker.licenseDocs as any)?.businessName,
            title: (qrCode.broker.licenseDocs as any)?.businessName,
            licenseNo: qrCode.broker.licenseNumber,
          }
        : undefined,
    };
  }

  async activateQRCode(id: string) {
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      throw new NotFoundException(`QR code with ID ${id} not found`);
    }

    if (qrCode.status === 'active') {
      throw new BadRequestException('QR code is already active');
    }

    const beforeStatus = qrCode.status;
    const beforeData = {
      status: qrCode.status,
      tenantId: qrCode.tenantId,
    };

    const updated = await this.prisma.qrCode.update({
      where: { id },
      data: {
        status: 'active',
      },
    });

    // Audit log the action
    await this.auditService.log({
      action: 'ACTIVATE_QR_CODE',
      entityType: 'QrCode',
      entityId: id,
      before: beforeData,
      after: {
        status: updated.status,
        tenantId: updated.tenantId,
      },
    });

    return {
      id: updated.id,
      status: 'ACTIVE',
      message: 'QR code activated successfully',
    };
  }

  async revokeQRCode(id: string) {
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      throw new NotFoundException(`QR code with ID ${id} not found`);
    }

    if (qrCode.status !== 'active') {
      throw new BadRequestException('QR code is not active');
    }

    const beforeData = {
      status: qrCode.status,
      tenantId: qrCode.tenantId,
    };

    const updated = await this.prisma.qrCode.update({
      where: { id },
      data: {
        status: 'revoked',
      },
    });

    // Audit log the action
    await this.auditService.log({
      action: 'REVOKE_QR_CODE',
      entityType: 'QrCode',
      entityId: id,
      before: beforeData,
      after: {
        status: updated.status,
        tenantId: updated.tenantId,
      },
    });

    return {
      id: updated.id,
      status: 'REVOKED',
      message: 'QR code revoked successfully',
    };
  }

  async getBrokers(limit: number = 50, offset: number = 0) {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    const [brokers, total] = await Promise.all([
      this.prisma.broker.findMany({
        where: { tenantId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
            },
          },
          qrCode: {
            select: {
              id: true,
              status: true,
            },
          },
          _count: {
            select: {
              listings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.broker.count({
        where: { tenantId },
      }),
    ]);

    return {
      items: brokers.map((broker) => ({
        id: broker.id,
        tenantId: broker.tenantId,
        userId: broker.userId,
        licenseNumber: broker.licenseNumber,
        licenseDocs: broker.licenseDocs as any,
        businessDocs: broker.businessDocs as any,
        status: broker.status,
        rating: broker.rating,
        strikeCount: broker.strikeCount,
        submittedAt: broker.submittedAt?.toISOString() || null,
        approvedAt: broker.approvedAt?.toISOString() || null,
        user: broker.user,
        qrCode: broker.qrCode
          ? {
              id: broker.qrCode.id,
              status: broker.qrCode.status,
            }
          : null,
        listingCount: broker._count.listings,
      })),
      total,
      limit,
      offset,
    };
  }

  async getBrokerById(id: string) {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    const broker = await this.prisma.broker.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
        qrCode: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        kycReviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });

    if (!broker) {
      throw new NotFoundException(`Broker with ID ${id} not found`);
    }

    return {
      id: broker.id,
      tenantId: broker.tenantId,
      userId: broker.userId,
      licenseNumber: broker.licenseNumber,
      licenseDocs: broker.licenseDocs as any,
      businessDocs: broker.businessDocs as any,
      status: broker.status,
      rating: broker.rating,
      strikeCount: broker.strikeCount,
      submittedAt: broker.submittedAt?.toISOString() || null,
      approvedAt: broker.approvedAt?.toISOString() || null,
      user: broker.user,
      qrCode: broker.qrCode
        ? {
            id: broker.qrCode.id,
            status: broker.qrCode.status,
            code: broker.qrCode.id,
            updatedAt: broker.qrCode.updatedAt.toISOString(),
          }
        : null,
      kycReviews: broker.kycReviews.map((review) => ({
        id: review.id,
        decision: review.decision,
        notes: review.notes,
        createdAt: review.createdAt.toISOString(),
        decidedAt: review.decidedAt?.toISOString() || null,
        reviewer: review.reviewer
          ? {
              id: review.reviewer.id,
              email: review.reviewer.email,
              role: review.reviewer.role,
            }
          : null,
      })),
      listingCount: broker._count.listings,
    };
  }

  async getListings(limit: number = 50, offset: number = 0) {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId },
        include: {
          property: {
            include: {
              broker: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.listing.count({
        where: { tenantId },
      }),
    ]);

    return {
      items: listings.map((listing) => ({
        id: listing.id,
        tenantId: listing.tenantId,
        property: listing.property,
        priceAmount: listing.priceAmount,
        priceCurrency: listing.priceCurrency,
        availabilityStatus: listing.availabilityStatus,
        featuredUntil: listing.featuredUntil?.toISOString() || null,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        broker: listing.property?.broker
          ? {
              id: listing.property.broker.id,
              licenseDocs: listing.property.broker.licenseDocs as any,
              status: listing.property.broker.status,
              user: listing.property.broker.user,
            }
          : null,
      })),
      total,
      limit,
      offset,
    };
  }

  async getUsers(limit: number = 50, offset: number = 0) {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        include: {
          broker: {
            select: {
              id: true,
              status: true,
              licenseDocs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({
        where: { tenantId },
      }),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        authProviderId: user.authProviderId || user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        broker: user.broker
          ? {
              id: user.broker.id,
              status: user.broker.status,
              licenseDocs: user.broker.licenseDocs as any,
            }
          : null,
      })),
      total,
      limit,
      offset,
    };
  }

  async getPendingReviews() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    try {
      // Get pending reviews (KYC reviews with decision = 'pending')
      const reviews = await this.prisma.kycReview.findMany({
        where: {
          tenantId,
          decision: 'pending',
        },
        include: {
          broker: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        items: reviews.map((review) => ({
          id: review.id,
          type: 'broker' as const, // KYC reviews are for brokers
          submittedBy: review.broker.user.email,
          createdAt: review.createdAt.toISOString(),
          status: 'PENDING' as const,
          note: review.notes || undefined,
        })),
        count: reviews.length,
      };
    } catch (error) {
      // Never return 404, return empty array on error
      return {
        items: [],
        count: 0,
      };
    }
  }

  async getPendingVerifications() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    try {
      // Get pending verifications (inspections with status = 'pending_sync')
      const inspections = await this.prisma.inspection.findMany({
        where: {
          tenantId,
          status: 'pending_sync',
        },
        include: {
          broker: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        items: inspections.map((inspection) => {
          // Determine subjectType based on inspection data
          // For now, we support BROKER and AGENCY. DRIVER can be added when driver verification is implemented
          let subjectType: 'BROKER' | 'AGENCY' | 'DRIVER';
          if (inspection.brokerId) {
            subjectType = 'BROKER';
          } else {
            // If no brokerId, it could be an agency or driver verification
            // For now, default to AGENCY. In the future, check inspection metadata for driver info
            subjectType = 'AGENCY';
          }

          return {
            id: inspection.id,
            subjectType,
            subjectId: inspection.brokerId || inspection.inspectorUserId,
            submittedAt: inspection.createdAt.toISOString(),
            status: 'PENDING' as const,
          };
        }),
        count: inspections.length,
      };
    } catch (error) {
      // Never return 404, return empty array on error
      return {
        items: [],
        count: 0,
      };
    }
  }

  async getPendingPayouts() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    try {
      // Get pending payouts (payment intents with status = 'processing', 'requires_capture', or 'succeeded' for pending payouts)
      // Note: We include 'succeeded' as 'PAID' status, but filter for pending/processing in the query
      const paymentIntents = await this.prisma.paymentIntent.findMany({
        where: {
          tenantId,
          status: {
            in: ['processing', 'requires_capture', 'requires_payment_method', 'requires_confirmation', 'requires_action'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        items: paymentIntents.map((intent) => {
          // Convert Decimal to number safely
          let amount: number;
          if (intent.amount && typeof intent.amount === 'object' && 'toNumber' in intent.amount) {
            amount = (intent.amount as any).toNumber();
          } else if (typeof intent.amount === 'string') {
            amount = parseFloat(intent.amount);
          } else {
            amount = Number(intent.amount) || 0;
          }

          // Map PaymentIntentStatus to Payout status
          let payoutStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
          switch (intent.status) {
            case 'processing':
            case 'requires_capture':
              payoutStatus = 'PROCESSING';
              break;
            case 'succeeded':
              payoutStatus = 'PAID';
              break;
            case 'canceled':
              payoutStatus = 'FAILED';
              break;
            default:
              payoutStatus = 'PENDING';
          }

          return {
            id: intent.id,
            accountId: intent.customerId, // Using customerId as accountId
            amount,
            currency: intent.currency,
            requestedAt: intent.createdAt.toISOString(),
            status: payoutStatus,
          };
        }),
        count: paymentIntents.length,
      };
    } catch (error) {
      // Never return 404, return empty array on error
      return {
        items: [],
        count: 0,
      };
    }
  }

  async getNotificationStats() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    try {
      // Calculate stats for last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // For now, use audit logs as a proxy for notifications
      // In a real system, you'd have a notifications table
      const [queued, failed, sent24h] = await Promise.all([
        // Queued: audit logs created in last hour that haven't been processed
        this.prisma.auditLog.count({
          where: {
            tenantId,
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            },
          },
        }),
        // Failed: audit logs with error actions
        this.prisma.auditLog.count({
          where: {
            tenantId,
            action: {
              contains: 'ERROR',
            },
          },
        }),
        // Sent in last 24h: all audit logs in last 24h
        this.prisma.auditLog.count({
          where: {
            tenantId,
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
        }),
      ]);

      return {
        queued,
        failed,
        sent24h,
      };
    } catch (error) {
      // Never return 404, return default stats on error
      return {
        queued: 0,
        failed: 0,
        sent24h: 0,
      };
    }
  }

  async getComplianceReports() {
    const tenantId = ReqContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    try {
      // Get compliance reports (KYC reviews with decisions)
      const reviews = await this.prisma.kycReview.findMany({
        where: {
          tenantId,
          decision: {
            in: ['approved', 'denied'],
          },
        },
        include: {
          broker: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { decidedAt: 'desc' },
      });

      return {
        items: reviews.map((review) => ({
          id: review.id,
          brokerId: review.brokerId,
          status: review.decision === 'approved' ? 'APPROVED' : 'REJECTED',
          createdAt: review.createdAt.toISOString(),
          decidedAt: review.decidedAt?.toISOString() || null,
          notes: review.notes || undefined,
        })),
        count: reviews.length,
      };
    } catch (error) {
      // Never return 404, return empty array on error
      return {
        items: [],
        count: 0,
      };
    }
  }
}
