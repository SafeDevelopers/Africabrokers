import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { ReviewsStatusCheck } from './reviews.status';
import { VerificationsStatusCheck } from './verifications.status';
import { PayoutsStatusCheck } from './payouts.status';
import { NotificationsStatusCheck } from './notifications.status';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    StatusService,
    ReviewsStatusCheck,
    VerificationsStatusCheck,
    PayoutsStatusCheck,
    NotificationsStatusCheck,
  ],
  exports: [StatusService],
})
export class StatusModule {}

