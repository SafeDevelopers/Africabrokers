import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';
import { ReqContext } from '../tenancy/req-scope.interceptor';

describe('BrokersService', () => {
  let service: BrokersService;
  let prisma: jest.Mocked<PrismaService>;
  let settingsHelper: jest.Mocked<PlatformSettingsHelper>;

  beforeEach(async () => {
    const mockPrisma = {
      broker: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      kycReview: {
        create: jest.fn(),
      },
    };

    const mockSettingsHelper = {
      getSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrokersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformSettingsHelper, useValue: mockSettingsHelper },
      ],
    }).compile();

    service = module.get<BrokersService>(BrokersService);
    prisma = module.get(PrismaService);
    settingsHelper = module.get(PlatformSettingsHelper);

    // Setup default ReqContext
    ReqContext.tenantId = 'test-tenant';
    ReqContext.userId = 'test-user';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitForReview', () => {
    it('should validate required documents according to settings', async () => {
      const brokerId = 'broker-123';
      const dto = {
        documentUrls: {
          licenseUrl: 'https://example.com/license.pdf',
          idUrl: 'https://example.com/id.pdf',
          // Missing selfieUrl
        },
      };

      const broker = {
        id: brokerId,
        tenantId: 'test-tenant',
        userId: 'test-user',
      };

      settingsHelper.getSettings.mockResolvedValue({
        tenancy: {
          brokerKyc: {
            requiredDocs: ['license', 'id', 'selfie'],
          },
        },
      } as any);

      prisma.broker.findUnique.mockResolvedValue(broker as any);

      await expect(service.submitForReview(brokerId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.broker.update).not.toHaveBeenCalled();
    });

    it('should allow submission when all required documents are provided', async () => {
      const brokerId = 'broker-123';
      const dto = {
        documentUrls: {
          licenseUrl: 'https://example.com/license.pdf',
          idUrl: 'https://example.com/id.pdf',
          selfieUrl: 'https://example.com/selfie.jpg',
        },
      };

      const broker = {
        id: brokerId,
        tenantId: 'test-tenant',
        userId: 'test-user',
      };

      settingsHelper.getSettings.mockResolvedValue({
        tenancy: {
          brokerKyc: {
            requiredDocs: ['license', 'id', 'selfie'],
          },
        },
      } as any);

      prisma.broker.findUnique.mockResolvedValue(broker as any);
      prisma.broker.update.mockResolvedValue({
        ...broker,
        status: 'submitted',
        submittedAt: new Date(),
      } as any);
      prisma.kycReview.create.mockResolvedValue({} as any);

      const result = await service.submitForReview(brokerId, dto);

      expect(result.success).toBe(true);
      expect(prisma.broker.update).toHaveBeenCalled();
      expect(prisma.kycReview.create).toHaveBeenCalled();
    });

    it('should use default required documents if settings not configured', async () => {
      const brokerId = 'broker-123';
      const dto = {
        documentUrls: {
          licenseUrl: 'https://example.com/license.pdf',
          idUrl: 'https://example.com/id.pdf',
          selfieUrl: 'https://example.com/selfie.jpg',
        },
      };

      const broker = {
        id: brokerId,
        tenantId: 'test-tenant',
        userId: 'test-user',
      };

      settingsHelper.getSettings.mockResolvedValue({
        tenancy: {},
      } as any);

      prisma.broker.findUnique.mockResolvedValue(broker as any);
      prisma.broker.update.mockResolvedValue({
        ...broker,
        status: 'submitted',
        submittedAt: new Date(),
      } as any);
      prisma.kycReview.create.mockResolvedValue({} as any);

      const result = await service.submitForReview(brokerId, dto);

      expect(result.success).toBe(true);
      // Should use default ['license', 'id', 'selfie']
    });
  });
});
