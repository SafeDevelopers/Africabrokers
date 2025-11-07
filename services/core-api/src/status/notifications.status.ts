import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusCheck } from './status-check.interface';

/**
 * Notifications service status check
 */
@Injectable()
export class NotificationsStatusCheck implements StatusCheck {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<{ status: 'ok' | 'degraded' | 'down'; latencyMs: number }> {
    const startTime = Date.now();
    try {
      // Check database connectivity as a proxy for notifications service
      await this.prisma.$queryRaw`SELECT 1`;
      
      const latencyMs = Date.now() - startTime;
      return {
        status: latencyMs < 500 ? 'ok' : 'degraded',
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        status: 'down',
        latencyMs,
      };
    }
  }
}

