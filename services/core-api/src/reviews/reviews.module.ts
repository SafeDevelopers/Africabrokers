import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SuperPlatformSettingsModule } from '../super-platform-settings/platform-settings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SuperPlatformSettingsModule, AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}