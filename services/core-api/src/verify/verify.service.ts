import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerifyService {
  constructor(private prisma: PrismaService) {}

  async verifyQrCode(qrCodeId: string) {
    const qrCode = await this.prisma.qrCode.findFirst({
      where: {
        OR: [{ id: qrCodeId }, { code: qrCodeId }],
      },
      include: {
        broker: {
          include: {
            user: true,
            tenant: true
          }
        },
        tenant: true
      }
    });

    if (!qrCode || qrCode.status !== 'active') {
      throw new NotFoundException('QR code not found or inactive');
    }

    if (!qrCode.broker || qrCode.broker.status !== 'approved') {
      return {
        valid: false,
        message: 'Broker not found or not approved',
        qrCodeId: qrCodeId
      };
    }

    return {
      valid: true,
      broker: {
        id: qrCode.broker.id,
        licenseNumber: qrCode.broker.licenseNumber,
        status: qrCode.broker.status,
        rating: qrCode.broker.rating,
        approvedAt: qrCode.broker.approvedAt,
        strikeCount: qrCode.broker.strikeCount
      },
      tenant: {
        name: qrCode.tenant.name,
        key: qrCode.tenant.key,
        brandConfig: qrCode.tenant.brandConfig
      },
      verifiedAt: new Date(),
      qrCodeId: qrCode.code
    };
  }
}
