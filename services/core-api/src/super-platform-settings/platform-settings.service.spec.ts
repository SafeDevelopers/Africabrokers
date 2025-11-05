import { Test, TestingModule } from '@nestjs/testing';
import { PlatformSettingsService } from './platform-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DEFAULT_PLATFORM_SETTINGS } from './platform-settings.types';

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    platformSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    superSettingsAudit: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAuditService = {
    logSuperAdminAction: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformSettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<PlatformSettingsService>(PlatformSettingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return default settings if none exist', async () => {
      mockPrismaService.platformSettings.findUnique.mockResolvedValue(null);

      const result = await service.get();

      expect(result).toEqual({
        version: 1,
        settings: DEFAULT_PLATFORM_SETTINGS,
      });
      expect(mockPrismaService.platformSettings.findUnique).toHaveBeenCalledWith({
        where: { id: true },
      });
    });

    it('should return existing settings', async () => {
      const existingSettings = {
        id: true,
        version: 2,
        settings: DEFAULT_PLATFORM_SETTINGS,
        updatedBy: 'user-id',
        updatedAt: new Date(),
      };

      mockPrismaService.platformSettings.findUnique.mockResolvedValue(
        existingSettings,
      );

      const result = await service.get();

      expect(result).toEqual({
        version: 2,
        settings: DEFAULT_PLATFORM_SETTINGS,
      });
    });
  });

  describe('put', () => {
    it('should create settings if none exist', async () => {
      const actorId = 'user-id';
      const newSettings = DEFAULT_PLATFORM_SETTINGS;

      mockPrismaService.platformSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.platformSettings.upsert.mockResolvedValue({
        id: true,
        version: 1,
        settings: newSettings,
        updatedBy: actorId,
        updatedAt: new Date(),
      });
      mockPrismaService.superSettingsAudit.create.mockResolvedValue({
        id: 'audit-id',
        version: 1,
        settings: newSettings,
        updatedBy: actorId,
        updatedAt: new Date(),
      });

      const result = await service.put(newSettings, actorId);

      expect(result).toEqual({
        version: 1,
        settings: newSettings,
      });
      expect(mockPrismaService.platformSettings.upsert).toHaveBeenCalled();
      expect(mockPrismaService.superSettingsAudit.create).toHaveBeenCalled();
      expect(mockAuditService.logSuperAdminAction).toHaveBeenCalled();
    });

    it('should update settings if they exist', async () => {
      const actorId = 'user-id';
      const oldSettings = DEFAULT_PLATFORM_SETTINGS;
      const newSettings = {
        ...DEFAULT_PLATFORM_SETTINGS,
        branding: {
          ...DEFAULT_PLATFORM_SETTINGS.branding,
          siteName: 'New Site Name',
        },
      };

      mockPrismaService.platformSettings.findUnique.mockResolvedValue({
        id: true,
        version: 1,
        settings: oldSettings,
        updatedBy: 'old-user',
        updatedAt: new Date(),
      });
      mockPrismaService.platformSettings.upsert.mockResolvedValue({
        id: true,
        version: 2,
        settings: newSettings,
        updatedBy: actorId,
        updatedAt: new Date(),
      });
      mockPrismaService.superSettingsAudit.create.mockResolvedValue({
        id: 'audit-id',
        version: 2,
        settings: newSettings,
        updatedBy: actorId,
        updatedAt: new Date(),
      });

      const result = await service.put(newSettings, actorId);

      expect(result).toEqual({
        version: 2,
        settings: newSettings,
      });
      expect(mockPrismaService.platformSettings.upsert).toHaveBeenCalled();
      expect(mockPrismaService.superSettingsAudit.create).toHaveBeenCalled();
      expect(mockAuditService.logSuperAdminAction).toHaveBeenCalledWith(
        'UPDATE_PLATFORM_SETTINGS',
        'PlatformSettings',
        'platform',
        expect.objectContaining({
          before: oldSettings,
          after: newSettings,
        }),
      );
    });
  });

  describe('audit', () => {
    it('should return audit history', async () => {
      const auditItems = [
        {
          id: 'audit-1',
          version: 2,
          settings: DEFAULT_PLATFORM_SETTINGS,
          updatedBy: 'user-1',
          updatedAt: new Date(),
        },
        {
          id: 'audit-2',
          version: 1,
          settings: DEFAULT_PLATFORM_SETTINGS,
          updatedBy: 'user-2',
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.superSettingsAudit.findMany.mockResolvedValue(
        auditItems,
      );
      mockPrismaService.superSettingsAudit.count.mockResolvedValue(2);

      const result = await service.audit(50, 0);

      expect(result).toEqual({
        items: auditItems,
        total: 2,
        limit: 50,
        offset: 0,
      });
      expect(mockPrismaService.superSettingsAudit.findMany).toHaveBeenCalledWith(
        {
          take: 50,
          skip: 0,
          orderBy: { updatedAt: 'desc' },
        },
      );
    });
  });
});

