import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  PlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from './platform-settings.types';

@Injectable()
export class PlatformSettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Get current platform settings
   */
  async get(): Promise<{ version: number; settings: PlatformSettings }> {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: true },
    });

    if (!settings) {
      // Return defaults if no settings exist
      return {
        version: 1,
        settings: DEFAULT_PLATFORM_SETTINGS,
      };
    }

    return {
      version: settings.version,
      settings: settings.settings as PlatformSettings,
    };
  }

  /**
   * Update platform settings
   */
  async put(
    newSettings: PlatformSettings,
    actorId: string,
  ): Promise<{ version: number; settings: PlatformSettings }> {
    const existing = await this.prisma.platformSettings.findUnique({
      where: { id: true },
    });

    const oldSettings = existing?.settings as PlatformSettings | undefined;
    const newVersion = existing ? existing.version + 1 : 1;

    // Create or update settings
    const result = await this.prisma.platformSettings.upsert({
      where: { id: true },
      create: {
        id: true,
        version: newVersion,
        settings: newSettings as any,
        updatedBy: actorId,
      },
      update: {
        version: newVersion,
        settings: newSettings as any,
        updatedBy: actorId,
      },
    });

    // Create audit log entry
    await this.prisma.superSettingsAudit.create({
      data: {
        version: newVersion,
        settings: newSettings as any,
        updatedBy: actorId,
      },
    });

    // Log to audit service
    await this.auditService.logSuperAdminAction(
      'UPDATE_PLATFORM_SETTINGS',
      'PlatformSettings',
      'platform',
      {
        before: oldSettings,
        after: newSettings,
        notes: `Platform settings updated to version ${newVersion}`,
      },
    );

    return {
      version: result.version,
      settings: result.settings as PlatformSettings,
    };
  }

  /**
   * Get audit history
   */
  async audit(limit: number = 50, offset: number = 0) {
    const [items, total] = await Promise.all([
      this.prisma.superSettingsAudit.findMany({
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.superSettingsAudit.count(),
    ]);

    return {
      items: items.map((item: any) => ({
        id: item.id,
        version: item.version,
        settings: item.settings,
        updatedBy: item.updatedBy,
        updatedAt: item.updatedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Seed default settings if none exist
   */
  async seed(actorId: string): Promise<void> {
    const existing = await this.prisma.platformSettings.findUnique({
      where: { id: true },
    });

    if (!existing) {
      await this.prisma.platformSettings.create({
        data: {
          id: true,
          version: 1,
          settings: DEFAULT_PLATFORM_SETTINGS as any,
          updatedBy: actorId,
        },
      });

      // Create initial audit entry
      await this.prisma.superSettingsAudit.create({
        data: {
          version: 1,
          settings: DEFAULT_PLATFORM_SETTINGS as any,
          updatedBy: actorId,
        },
      });

      await this.auditService.logSuperAdminAction(
        'SEED_PLATFORM_SETTINGS',
        'PlatformSettings',
        'platform',
        {
          after: DEFAULT_PLATFORM_SETTINGS,
          notes: 'Initial platform settings seeded',
        },
      );
    }
  }
}

