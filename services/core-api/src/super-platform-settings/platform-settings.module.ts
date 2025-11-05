import { Module } from '@nestjs/common';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsHelper } from './platform-settings.helper';
import { TenantPolicyService } from './tenant-policy.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { TwoFactorGuard, IpAllowlistGuard } from './platform-settings.guards';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PlatformSettingsController],
  providers: [
    PlatformSettingsService,
    PlatformSettingsHelper,
    TenantPolicyService,
    TwoFactorGuard,
    IpAllowlistGuard,
  ],
  exports: [PlatformSettingsService, PlatformSettingsHelper, TenantPolicyService],
})
export class SuperPlatformSettingsModule {}

