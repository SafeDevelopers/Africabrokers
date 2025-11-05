import { PrismaClient } from '@prisma/client';
import { DEFAULT_PLATFORM_SETTINGS } from './platform-settings.types';

const prisma = new PrismaClient();

/**
 * Seed default platform settings if none exist
 * Run this after migrations to ensure default settings are in place
 */
export async function seedPlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({
    where: { id: true },
  });

  if (!existing) {
    // Use a system user ID for seeding
    const systemUserId = '00000000-0000-0000-0000-000000000000';

    await prisma.platformSettings.create({
      data: {
        id: true,
        version: 1,
        settings: DEFAULT_PLATFORM_SETTINGS as any,
        updatedBy: systemUserId,
      },
    });

    // Create initial audit entry
    await prisma.superSettingsAudit.create({
      data: {
        version: 1,
        settings: DEFAULT_PLATFORM_SETTINGS as any,
        updatedBy: systemUserId,
      },
    });

    console.log('Platform settings seeded successfully');
  } else {
    console.log('Platform settings already exist, skipping seed');
  }
}

// Run if called directly
if (require.main === module) {
  seedPlatformSettings()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

