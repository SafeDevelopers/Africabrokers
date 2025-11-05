import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SuperPlatformSettingsModule } from '../super-platform-settings/platform-settings.module';
import { InquiryRateLimitMiddleware } from './inquiry-rate-limit.middleware';

@Module({
  imports: [PrismaModule, SuperPlatformSettingsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService, InquiryRateLimitMiddleware],
  exports: [InquiriesService, InquiryRateLimitMiddleware],
})
export class InquiriesModule {}

