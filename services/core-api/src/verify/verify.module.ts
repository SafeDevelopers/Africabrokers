import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';
import { SuperPlatformSettingsModule } from '../super-platform-settings/platform-settings.module';

@Module({
  imports: [SuperPlatformSettingsModule],
  controllers: [VerifyController],
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule {}