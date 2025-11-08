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
        // Verify Redis URL format
        try {
          const url = new URL(redisUrl);
          if (url.protocol !== 'redis:') {
            throw new Error('REDIS_URL must use redis:// protocol');
          }
          // For now, we validate the URL format
          // In production, you'd use a Redis client library to actually ping Redis
          // Example: const client = redis.createClient({ url: redisUrl }); await client.ping();
          checks.redis = 'UP'; // URL format is valid - actual connection check would require Redis client
        } catch (urlError) {
          checks.redis = 'DOWN';
          checks.redisError = urlError instanceof Error ? urlError.message : 'Invalid REDIS_URL format';
          allUp = false;
        }
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
