import { Injectable } from '@nestjs/common';
import { StatusCheck } from './status-check.interface';
import { ReviewsStatusCheck } from './reviews.status';
import { VerificationsStatusCheck } from './verifications.status';
import { PayoutsStatusCheck } from './payouts.status';
import { NotificationsStatusCheck } from './notifications.status';

/**
 * Status service that runs all module checks in parallel with timeout
 */
@Injectable()
export class StatusService {
  private readonly CHECK_TIMEOUT_MS = 2000; // 2 seconds per check

  constructor(
    private reviewsCheck: ReviewsStatusCheck,
    private verificationsCheck: VerificationsStatusCheck,
    private payoutsCheck: PayoutsStatusCheck,
    private notificationsCheck: NotificationsStatusCheck,
  ) {}

  /**
   * Run a single check with timeout
   */
  private async runCheckWithTimeout(
    name: string,
    check: StatusCheck,
  ): Promise<{ status: 'ok' | 'degraded' | 'down'; latencyMs: number; updatedAt: string }> {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        check.check(),
        new Promise<{ status: 'ok' | 'degraded' | 'down'; latencyMs: number }>((_, reject) =>
          setTimeout(() => reject(new Error('Check timeout')), this.CHECK_TIMEOUT_MS),
        ),
      ]);

      return {
        ...result,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        status: 'down',
        latencyMs: latencyMs >= this.CHECK_TIMEOUT_MS ? this.CHECK_TIMEOUT_MS : latencyMs,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Run all status checks in parallel
   */
  async checkAll(): Promise<{
    services: {
      reviews: { status: 'ok' | 'degraded' | 'down'; latencyMs: number; updatedAt: string };
      verifications: { status: 'ok' | 'degraded' | 'down'; latencyMs: number; updatedAt: string };
      payouts: { status: 'ok' | 'degraded' | 'down'; latencyMs: number; updatedAt: string };
      notifications: { status: 'ok' | 'degraded' | 'down'; latencyMs: number; updatedAt: string };
    };
    version: string;
    time: string;
  }> {
    const version = process.env.GIT_SHA || process.env.VERSION || '0.1.0';
    const time = new Date().toISOString();

    // Run all checks in parallel
    const [reviews, verifications, payouts, notifications] = await Promise.all([
      this.runCheckWithTimeout('reviews', this.reviewsCheck),
      this.runCheckWithTimeout('verifications', this.verificationsCheck),
      this.runCheckWithTimeout('payouts', this.payoutsCheck),
      this.runCheckWithTimeout('notifications', this.notificationsCheck),
    ]);

    return {
      services: {
        reviews,
        verifications,
        payouts,
        notifications,
      },
      version,
      time,
    };
  }
}

