import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperPlatformSettingsModule } from '../super-platform-settings/platform-settings.module';
import { LeadRateLimitMiddleware } from './lead-rate-limit.middleware';

@Module({
  imports: [PrismaModule, SuperPlatformSettingsModule],
  controllers: [PublicController],
  providers: [LeadRateLimitMiddleware],
  exports: [LeadRateLimitMiddleware],
})
export class PublicModule {}

