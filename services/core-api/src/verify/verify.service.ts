import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';

@Injectable()
export class VerifyService {
  constructor(
    private prisma: PrismaService,
    private settingsHelper: PlatformSettingsHelper,
  ) {}

  async verifyQrCode(qrCodeId: string, signature?: string, ttl?: number) {
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

    // Check TTL signature if configured (with tenant overrides)
    const settings = await this.settingsHelper.getEffectiveSettings();
    const qrSignature = settings.tenancy?.license?.qrSignature || 'none';
    
    if (qrSignature === 'signed-ttl') {
      if (!signature || !ttl) {
        throw new BadRequestException('TTL signature required for verification');
      }
      
      // Validate TTL (Time To Live) - check if signature is not expired
      const now = Date.now();
      if (ttl < now) {
        throw new BadRequestException('TTL signature expired');
      }
      
      // TODO: In production, validate the signature cryptographically
      // For now, we just check that TTL is in the future
      // This should be replaced with proper cryptographic signature validation
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
