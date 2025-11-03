import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateInspectionDto {
  qrCodeId: string;
  verificationResult: any;
  violationType?: string;
  violationNotes?: string;
  location?: { latitude: number; longitude: number };
  photos?: string[];
}

export interface InspectionQuery {
  tenantId?: string;
  inspectorUserId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  async createInspection(userId: string, tenantId: string, dto: CreateInspectionDto) {
    // Verify user is an inspector
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'inspector') {
      throw new UnauthorizedException('Only inspectors can create inspections');
    }

    // Find broker by QR code if available
    const qrCode = await this.prisma.qrCode.findUnique({
      where: { id: dto.qrCodeId },
      include: { broker: true },
    });

    const brokerId = qrCode?.broker?.id || null;

    const inspection = await this.prisma.inspection.create({
      data: {
        tenantId,
        inspectorUserId: userId,
        qrCodeId: dto.qrCodeId,
        brokerId,
        verificationResult: dto.verificationResult,
        violationType: dto.violationType,
        violationNotes: dto.violationNotes,
        location: dto.location || null,
        photos: dto.photos || [],
        status: 'synced', // Mark as synced when created via API
      },
      include: {
        inspector: {
          select: {
            id: true,
            role: true,
          },
        },
        broker: {
          select: {
            id: true,
            licenseNumber: true,
            status: true,
          },
        },
      },
    });

    return inspection;
  }

  async getInspections(userId: string, query: InspectionQuery) {
    // Verify user is an inspector or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role !== 'inspector' && user.role !== 'admin' && user.role !== 'regulator')) {
      throw new UnauthorizedException('Only inspectors, admins, and regulators can view inspections');
    }

    const where: any = {};
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.inspectorUserId) where.inspectorUserId = query.inspectorUserId;
    if (query.status) where.status = query.status;

    // If inspector, only show their own inspections unless admin/regulator
    if (user.role === 'inspector') {
      where.inspectorUserId = userId;
    }

    const inspections = await this.prisma.inspection.findMany({
      where,
      include: {
        inspector: {
          select: {
            id: true,
            role: true,
          },
        },
        broker: {
          select: {
            id: true,
            licenseNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    const total = await this.prisma.inspection.count({ where });

    return {
      data: inspections,
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
  }

  async getInspectionById(id: string, userId: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        inspector: {
          select: {
            id: true,
            role: true,
          },
        },
        broker: {
          select: {
            id: true,
            licenseNumber: true,
            status: true,
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Verify user has access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || (user.role === 'inspector' && inspection.inspectorUserId !== userId)) {
      throw new UnauthorizedException('You do not have access to this inspection');
    }

    return inspection;
  }
}

