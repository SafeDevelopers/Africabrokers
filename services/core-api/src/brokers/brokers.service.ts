import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

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
    const tenantId = ReqContext.tenantId;
    const userId = ReqContext.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedException('Authentication required to create broker profile');
    }

    const broker = await this.prisma.broker.create({
      data: {
        tenantId,
        userId,
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
    const tenantId = ReqContext.tenantId;
    const userId = ReqContext.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const broker = await this.prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker || broker.tenantId !== tenantId || broker.userId !== userId) {
      throw new ForbiddenException('You do not have permission to submit this broker');
    }

    const updatedBroker = await this.prisma.broker.update({
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
        tenantId: updatedBroker.tenantId,
        brokerId: updatedBroker.id,
        decision: 'pending'
      }
    });

    return {
      success: true,
      message: 'Broker submitted for review',
      broker: {
        id: updatedBroker.id,
        status: updatedBroker.status,
        submittedAt: updatedBroker.submittedAt
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
      throw new NotFoundException('Broker not found');
    }

    const tenantId = ReqContext.tenantId;
    if (tenantId && broker.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return broker;
  }

  async requestDocumentUrls(brokerId: string) {
    const tenantId = ReqContext.tenantId;
    const userId = ReqContext.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const broker = await this.prisma.broker.findUnique({
      where: { id: brokerId }
    });

    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    if (broker.tenantId !== tenantId || broker.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this broker');
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
