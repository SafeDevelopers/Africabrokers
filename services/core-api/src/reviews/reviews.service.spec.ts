import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: jest.Mocked<PrismaService>;
  let settingsHelper: jest.Mocked<PlatformSettingsHelper>;

  beforeEach(async () => {
    const mockPrisma = {
      kycReview: {
        update: jest.fn(),
      },
      broker: {
        update: jest.fn(),
      },
      license: {
        create: jest.fn(),
      },
      qrCode: {
        create: jest.fn(),
      },
    };

    const mockSettingsHelper = {
      getSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformSettingsHelper, useValue: mockSettingsHelper },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get(PrismaService);
    settingsHelper = module.get(PlatformSettingsHelper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeReviewDecision', () => {
    it('should validate license number pattern when configured', async () => {
      const reviewId = 'review-123';
      const dto = {
        decision: 'approved' as const,
        notes: 'Approved',
      };

      const review = {
        id: reviewId,
        brokerId: 'broker-123',
        broker: {
          id: 'broker-123',
          tenantId: 'test-tenant',
          userId: 'user-123',
          licenseNumber: 'INVALID-LICENSE',
        },
      };

      settingsHelper.getSettings.mockResolvedValue({
        tenancy: {
          license: {
            pattern: '^[A-Z]{2,3}-[A-Z]{2}-\\d{4,6}$',
            defaultExpiryMonths: 12,
          },
        },
      } as any);

      prisma.kycReview.update.mockResolvedValue(review as any);

      await expect(service.makeReviewDecision(reviewId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.broker.update).not.toHaveBeenCalled();
    });

    it('should create license with expiry based on settings', async () => {
      const reviewId = 'review-123';
      const dto = {
        decision: 'approved' as const,
        notes: 'Approved',
      };

      const review = {
        id: reviewId,
        brokerId: 'broker-123',
        broker: {
          id: 'broker-123',
          tenantId: 'test-tenant',
          userId: 'user-123',
          licenseNumber: 'AF-ET-123456',
        },
      };

      settingsHelper.getSettings.mockResolvedValue({
        tenancy: {
          license: {
            pattern: '^[A-Z]{2,3}-[A-Z]{2}-\\d{4,6}$',
            defaultExpiryMonths: 24,
          },
        },
      } as any);

      prisma.kycReview.update.mockResolvedValue(review as any);
      prisma.broker.update.mockResolvedValue({} as any);
      prisma.license.create.mockResolvedValue({} as any);
      prisma.qrCode.create.mockResolvedValue({} as any);

      await service.makeReviewDecision(reviewId, dto);

      expect(prisma.license.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            licenseNo: 'AF-ET-123456',
            expiresAt: expect.any(Date),
          }),
        }),
      );

      const createCall = prisma.license.create.mock.calls[0][0];
      const issuedAt = createCall.data.issuedAt;
      const expiresAt = createCall.data.expiresAt;
      const monthsDiff =
        (expiresAt.getTime() - issuedAt.getTime()) /
        (1000 * 60 * 60 * 24 * 30);
      expect(Math.round(monthsDiff)).toBe(24);
    });
  });
});

