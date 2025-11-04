import { UnauthorizedException } from '@nestjs/common';
import { InspectionsService } from './inspections.service';

describe('InspectionsService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    qrCode: {
      findUnique: jest.fn(),
    },
    inspection: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const service = new InspectionsService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects create when user is not an inspector', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'BROKER' });

    await expect(
      service.createInspection('user-1', 'tenant-1', {
        qrCodeId: 'qr-1',
        verificationResult: {},
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates inspection when inspector user is provided', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'user-1', role: 'INSPECTOR' })
      .mockResolvedValueOnce({ id: 'user-1', role: 'INSPECTOR' });
    prisma.qrCode.findUnique.mockResolvedValue({
      id: 'qr-1',
      broker: { id: 'broker-1' },
    });
    prisma.inspection.create.mockResolvedValue({
      id: 'inspection-1',
      tenantId: 'tenant-1',
    });

    const inspection = await service.createInspection('user-1', 'tenant-1', {
      qrCodeId: 'qr-1',
      verificationResult: { status: 'verified' },
    });

    expect(inspection.id).toBe('inspection-1');
    expect(prisma.inspection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          brokerId: 'broker-1',
        }),
      }),
    );
  });

  it('filters inspections for inspector role', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'INSPECTOR' });
    prisma.inspection.findMany.mockResolvedValue([]);
    prisma.inspection.count.mockResolvedValue(0);

    await service.getInspections('user-1', {});

    expect(prisma.inspection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { inspectorUserId: 'user-1' },
      }),
    );
  });
});
