import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';
import { StatusCheck } from './status-check.interface';

/**
 * Verifications service status check
 */
@Injectable()
export class VerificationsStatusCheck implements StatusCheck {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<{ status: 'ok' | 'degraded' | 'down'; latencyMs: number }> {
    const startTime = Date.now();
    try {
      const tenantId = ReqContext.tenantId;
      
      if (tenantId) {
        await this.prisma.inspection.findFirst({
          where: { tenantId, status: 'pending_sync' },
          take: 1,
        });
      } else {
        await this.prisma.inspection.findFirst({
          where: { status: 'pending_sync' },
          take: 1,
        });
      }
      
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

