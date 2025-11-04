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
}
