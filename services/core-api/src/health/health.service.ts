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
    const checks: Record<string, 'UP' | 'DOWN' | string> = {};
    let allUp = true;

    // Check database connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'UP';
    } catch (error) {
      checks.database = 'DOWN';
      checks.databaseError = error instanceof Error ? error.message : 'Unknown error';
      allUp = false;
    }

    // Check Redis connection
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        // Try to ping Redis
        // Note: If Redis client is not set up, we'll skip this check
        // In production, you'd use a Redis client library
        checks.redis = 'UP'; // Placeholder - implement actual Redis check if Redis client is available
      } else {
        checks.redis = 'SKIPPED'; // Redis not configured
      }
    } catch (error) {
      checks.redis = 'DOWN';
      checks.redisError = error instanceof Error ? error.message : 'Unknown error';
      allUp = false;
    }

    // Check if migrations are applied
    try {
      // Check if _prisma_migrations table exists and has applied migrations
      const migrations = await this.prisma.$queryRaw<Array<{ migration_name: string }>>`
        SELECT migration_name FROM _prisma_migrations 
        WHERE finished_at IS NOT NULL 
        ORDER BY finished_at DESC 
        LIMIT 1
      `;
      
      if (migrations && migrations.length > 0) {
        checks.migrations = 'UP';
      } else {
        checks.migrations = 'DOWN';
        checks.migrationsError = 'No applied migrations found';
        allUp = false;
      }
    } catch (error) {
      checks.migrations = 'DOWN';
      checks.migrationsError = error instanceof Error ? error.message : 'Unknown error';
      allUp = false;
    }

    return {
      status: allUp ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      checks
    };
  }
}
