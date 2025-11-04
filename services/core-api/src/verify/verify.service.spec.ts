import { NotFoundException } from '@nestjs/common';
import { VerifyService } from './verify.service';

describe('VerifyService', () => {
  const prisma = {
    qrCode: {
      findFirst: jest.fn(),
    },
  };

  const service = new VerifyService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns broker details when QR code is active and broker approved', async () => {
    const now = new Date();
    prisma.qrCode.findFirst.mockResolvedValue({
      id: 'AFR-QR-0001',
      code: 'AFR-QR-0001',
      status: 'active',
      broker: {
        id: 'broker-1',
        licenseNumber: 'ETH-AA-0001',
        status: 'approved',
        rating: 4.5,
        approvedAt: now,
        strikeCount: 0,
        user: {},
        tenant: {},
      },
      tenant: {
        name: 'AfriBrok',
        key: 'et-addis',
        brandConfig: { primaryColor: '#000' },
      },
    });

    const result = await service.verifyQrCode('AFR-QR-0001');

    expect(prisma.qrCode.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: 'AFR-QR-0001' }, { code: 'AFR-QR-0001' }] },
      include: expect.any(Object),
    });
    expect(result.valid).toBe(true);
    expect(result.broker?.id).toBe('broker-1');
    expect(result.tenant?.key).toBe('et-addis');
  });

  it('returns invalid response when broker is not approved', async () => {
    prisma.qrCode.findFirst.mockResolvedValue({
      id: 'AFR-QR-0002',
      code: 'AFR-QR-0002',
      status: 'active',
      broker: {
        id: 'broker-2',
        licenseNumber: 'ETH-AA-0002',
        status: 'submitted',
        rating: null,
        approvedAt: null,
        strikeCount: 0,
        user: {},
        tenant: {},
      },
      tenant: {
        name: 'AfriBrok',
        key: 'et-addis',
        brandConfig: {},
      },
    });

    const result = await service.verifyQrCode('AFR-QR-0002');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/not approved/i);
  });

  it('throws when QR code is missing or inactive', async () => {
    prisma.qrCode.findFirst.mockResolvedValue(null);
    await expect(service.verifyQrCode('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
