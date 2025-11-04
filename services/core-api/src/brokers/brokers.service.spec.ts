import { BrokersService } from './brokers.service';

describe('BrokersService', () => {
  const prisma = {
    broker: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    kycReview: {
      create: jest.fn(),
    },
  };

  const service = new BrokersService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a broker draft with document placeholders', async () => {
    prisma.broker.create.mockResolvedValue({
      id: 'broker-1',
      licenseNumber: 'ETH-AA-0001',
      status: 'draft',
    });

    const result = await service.createBroker({
      licenseNumber: 'ETH-AA-0001',
      businessName: 'Test Broker LLC',
    });

    expect(prisma.broker.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          licenseNumber: 'ETH-AA-0001',
          licenseDocs: expect.objectContaining({ businessName: 'Test Broker LLC' }),
        }),
      }),
    );

    expect(result.broker.status).toBe('draft');
    expect(result.uploadUrls.license).toContain('broker-1');
  });

  it('submits a broker for review and queues KYC task', async () => {
    prisma.broker.update.mockResolvedValue({
      id: 'broker-1',
      tenantId: 'tenant-1',
      status: 'submitted',
      submittedAt: new Date(),
    });

    await service.submitForReview('broker-1', {
      documentUrls: {
        licenseUrl: 'https://example.com/license.pdf',
        idUrl: 'https://example.com/id.pdf',
        selfieUrl: 'https://example.com/selfie.jpg',
      },
    });

    expect(prisma.broker.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'broker-1' },
        data: expect.objectContaining({
          status: 'submitted',
        }),
      }),
    );

    expect(prisma.kycReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          brokerId: 'broker-1',
          decision: 'pending',
        }),
      }),
    );
  });

  it('throws when broker cannot be found', async () => {
    prisma.broker.findUnique.mockResolvedValue(null);

    await expect(service.getBrokerById('missing')).rejects.toThrow('Broker not found');
  });
});
