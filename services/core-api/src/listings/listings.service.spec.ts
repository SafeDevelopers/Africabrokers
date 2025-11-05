import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettingsHelper } from '../super-platform-settings/platform-settings.helper';
import { ReqContext } from '../tenancy/req-scope.interceptor';

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: jest.Mocked<PrismaService>;
  let settingsHelper: jest.Mocked<PlatformSettingsHelper>;

  beforeEach(async () => {
    const mockPrisma = {
      broker: {
        findFirst: jest.fn(),
      },
      property: {
        findUnique: jest.fn(),
      },
      listing: {
        create: jest.fn(),
      },
    };

    const mockSettingsHelper = {
      getSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformSettingsHelper, useValue: mockSettingsHelper },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    prisma = module.get(PrismaService);
    settingsHelper = module.get(PlatformSettingsHelper);

    ReqContext.tenantId = 'test-tenant';
    ReqContext.userId = 'test-user';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createListing', () => {
    it('should force pending_review when prePublish is required', async () => {
      const dto = {
        propertyId: 'property-123',
        priceAmount: 1000,
        priceCurrency: 'ETB',
        availabilityStatus: 'active' as const,
      };

      const broker = {
        id: 'broker-123',
        tenantId: 'test-tenant',
        userId: 'test-user',
        status: 'approved',
      };

      const property = {
        id: 'property-123',
        tenantId: 'test-tenant',
      };

      settingsHelper.getSettings.mockResolvedValue({
        marketplace: {
          review: {
            prePublish: true,
          },
        },
      } as any);

      prisma.broker.findFirst.mockResolvedValue(broker as any);
      prisma.property.findUnique.mockResolvedValue(property as any);
      prisma.listing.create.mockResolvedValue({
        ...dto,
        availabilityStatus: 'pending_review',
        publishedAt: null,
      } as any);

      await service.createListing(dto);

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availabilityStatus: 'pending_review',
            publishedAt: null,
          }),
        }),
      );
    });

    it('should allow direct publish when prePublish is false', async () => {
      const dto = {
        propertyId: 'property-123',
        priceAmount: 1000,
        priceCurrency: 'ETB',
        availabilityStatus: 'active' as const,
      };

      const broker = {
        id: 'broker-123',
        tenantId: 'test-tenant',
        userId: 'test-user',
        status: 'approved',
      };

      const property = {
        id: 'property-123',
        tenantId: 'test-tenant',
      };

      settingsHelper.getSettings.mockResolvedValue({
        marketplace: {
          review: {
            prePublish: false,
          },
        },
      } as any);

      prisma.broker.findFirst.mockResolvedValue(broker as any);
      prisma.property.findUnique.mockResolvedValue(property as any);
      prisma.listing.create.mockResolvedValue({
        ...dto,
        availabilityStatus: 'active',
        publishedAt: expect.any(Date),
      } as any);

      await service.createListing(dto);

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            availabilityStatus: 'active',
            publishedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});

