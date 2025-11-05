import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { SuperPlatformSettingsModule } from '../super-platform-settings/platform-settings.module';

@Module({
  imports: [SuperPlatformSettingsModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}