import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBrokerDto {
  licenseNumber: string;
  businessName?: string;
}

export interface SubmitBrokerDto {
  documentUrls: {
    licenseUrl: string;
    idUrl: string;
    selfieUrl: string;
  };
}

export interface ReviewDecisionDto {
  decision: 'approved' | 'denied' | 'needs_more_info';
  notes?: string;
}

@Injectable()
export class BrokersService {
  constructor(private prisma: PrismaService) {}

  async createBroker(dto: CreateBrokerDto) {
    // TODO: Get userId and tenantId from request context
    const mockUserId = 'mock-user-id';
    const mockTenantId = 'mock-tenant-id';

    const broker = await this.prisma.broker.create({
      data: {
        tenantId: mockTenantId,
        userId: mockUserId,
        licenseNumber: dto.licenseNumber,
        licenseDocs: {
          businessName: dto.businessName
        },
        status: 'draft'
      }
    });

    return {
      success: true,
      broker: {
        id: broker.id,
        licenseNumber: broker.licenseNumber,
        status: broker.status
      },
      uploadUrls: {
        license: `/api/upload/license/${broker.id}`,
        id: `/api/upload/id/${broker.id}`,
        selfie: `/api/upload/selfie/${broker.id}`
      }
    };
  }

  async submitForReview(brokerId: string, dto: SubmitBrokerDto) {
    const broker = await this.prisma.broker.update({
      where: { id: brokerId },
      data: {
        licenseDocs: dto.documentUrls,
        status: 'submitted',
        submittedAt: new Date()
      }
    });

    // Create KYC review record
    await this.prisma.kycReview.create({
      data: {
        tenantId: broker.tenantId,
        brokerId: broker.id,
        decision: 'pending'
      }
    });

    return {
      success: true,
      message: 'Broker submitted for review',
      broker: {
        id: broker.id,
        status: broker.status,
        submittedAt: broker.submittedAt
      }
    };
  }

  async getBrokerById(id: string) {
    const broker = await this.prisma.broker.findUnique({
      where: { id },
      include: {
        user: true,
        qrCode: true,
        kycReviews: {
          include: {
            reviewer: true
          }
        }
      }
    });

    if (!broker) {
      throw new Error('Broker not found');
    }

    return broker;
  }

  async requestDocumentUrls(brokerId: string) {
    // TODO: Integrate with media-service for presigned URLs
    const broker = await this.prisma.broker.findUnique({
      where: { id: brokerId }
    });

    if (!broker) {
      throw new Error('Broker not found');
    }

    return {
      success: true,
      uploadUrls: {
        license: `/api/media/upload/license/${brokerId}`,
        id: `/api/media/upload/id/${brokerId}`,
        selfie: `/api/media/upload/selfie/${brokerId}`
      },
      expiresIn: '1h'
    };
  }
}