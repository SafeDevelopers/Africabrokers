import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkLiveness() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'afribrok-core-api',
      version: '0.1.0'
    };
  }

  async checkReadiness() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'UP',
          // TODO: Add Redis check
          // TODO: Add MinIO check
        }
      };
    } catch (error) {
      return {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'DOWN',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}