import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { loadServerEnv } from "@afribrok/env/server";

async function bootstrap() {
  // Validate required environment variables at startup
  // Check critical envs: DATABASE_URL, REDIS_URL, JWT_ISSUER, JWT_AUDIENCE, OIDC_ISSUER_URL, CORS_ALLOWED_ORIGINS
  // Note: JWT_ISSUER and JWT_AUDIENCE are optional but recommended for production
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'OIDC_ISSUER_URL',
  ];
  
  const recommendedEnvVars = [
    'JWT_ISSUER',
    'JWT_AUDIENCE',
    'CORS_ALLOWED_ORIGINS',
  ];
  
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingRequired.push(varName);
    }
  }
  
  for (const varName of recommendedEnvVars) {
    if (!process.env[varName]) {
      missingRecommended.push(varName);
    }
  }
  
  if (missingRequired.length > 0) {
    Logger.error('❌ Missing required environment variables:', 'Bootstrap');
    missingRequired.forEach(varName => {
      Logger.error(`   - ${varName}`, 'Bootstrap');
    });
    Logger.error('\n💡 Please check your .env file and ensure all required variables are set.', 'Bootstrap');
    Logger.error('   See .env.example for reference.\n', 'Bootstrap');
    process.exit(1);
  }
  
  if (missingRecommended.length > 0 && process.env.NODE_ENV === 'production') {
    Logger.warn('⚠️  Missing recommended environment variables (may cause issues in production):', 'Bootstrap');
    missingRecommended.forEach(varName => {
      Logger.warn(`   - ${varName}`, 'Bootstrap');
    });
    Logger.warn('   Consider setting these for production deployments.\n', 'Bootstrap');
  }
  
  try {
    const env = loadServerEnv();
    Logger.log('✅ Environment variables validated', 'Bootstrap');
    
    // Warn about production secrets with default values
    if (process.env.NODE_ENV === 'production') {
      if (process.env.JWT_SECRET === 'dev-secret-change-in-production') {
        Logger.warn('⚠️  JWT_SECRET is using default value. CHANGE IN PRODUCTION!', 'Bootstrap');
      }
      if (process.env.CSRF_SECRET === 'change-me-in-production') {
        Logger.warn('⚠️  CSRF_SECRET is using default value. CHANGE IN PRODUCTION!', 'Bootstrap');
      }
    }
  } catch (error) {
    Logger.error('❌ Environment variable validation failed:', 'Bootstrap');
    if (error instanceof Error) {
      Logger.error(error.message, 'Bootstrap');
    }
    Logger.error('\n💡 Please check your .env file and ensure all required variables are set.', 'Bootstrap');
    Logger.error('   See .env.example for reference.\n', 'Bootstrap');
    process.exit(1);
  }
  
  // Verify database and Redis connectivity on startup
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    Logger.log('✅ Database connection verified', 'Bootstrap');
    await prisma.$disconnect();
  } catch (error) {
    Logger.error('❌ Database connection failed:', 'Bootstrap');
    if (error instanceof Error) {
      Logger.error(`   ${error.message}`, 'Bootstrap');
    }
    Logger.error('   Check DATABASE_URL and ensure database is accessible.', 'Bootstrap');
    Logger.error('   For CapRover, use: postgresql://postgres:PASSWORD@postgres.captain:5432/postgres', 'Bootstrap');
    Logger.error('   Or: postgresql://postgres:PASSWORD@srv-captain--afribrok-db:5432/postgres\n', 'Bootstrap');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  // Verify Redis connectivity (if REDIS_URL is set)
  if (process.env.REDIS_URL) {
    try {
      // Try to parse Redis URL and verify format
      const redisUrl = new URL(process.env.REDIS_URL);
      if (redisUrl.protocol !== 'redis:') {
        throw new Error('REDIS_URL must use redis:// protocol');
      }
      Logger.log('✅ Redis URL format verified', 'Bootstrap');
      Logger.log(`   Redis host: ${redisUrl.hostname}:${redisUrl.port || 6379}`, 'Bootstrap');
      Logger.log('   For CapRover, use: redis://redis.captain:6379', 'Bootstrap');
      Logger.log('   Or: redis://:PASSWORD@redis.captain:6379', 'Bootstrap');
      Logger.log('   Or: redis://:PASSWORD@srv-captain--afribrok-redis:6379\n', 'Bootstrap');
    } catch (error) {
      Logger.error('❌ Redis URL validation failed:', 'Bootstrap');
      if (error instanceof Error) {
        Logger.error(`   ${error.message}`, 'Bootstrap');
      }
      Logger.error('   Check REDIS_URL format.', 'Bootstrap');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  // Server binding: listen on 0.0.0.0 and port (process.env.PORT || 8080)
  // CapRover expects port 8080 by default (matches Dockerfile EXPOSE 8080)
  const port = process.env.PORT || 8080;
  const host = '0.0.0.0'; // Bind to all interfaces for Docker/CapRover
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhook signature verification
  });
  app.setGlobalPrefix("v1");
  
  // Enable global validation pipe with transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Enable CORS - exactly match CORS-CHECK.md
  // Allow origins: admin + marketplace domains (and localhost dev if present)
  const corsAllowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
  const allowedOrigins = corsAllowedOriginsEnv
    ? corsAllowedOriginsEnv.split(',').map(origin => origin.trim())
    : [
        // Local development origins
        'http://localhost:3000', // web-admin (default Next.js port)
        'http://localhost:3004', // web-admin (alternative port)
        'http://localhost:3003', // web-marketplace
        'http://localhost:3006',
        // Production domains: admin + marketplace
        'https://admin.afribrok.com', // web-admin
        'https://afribrok.com', // web-marketplace
        'https://market.afribrok.com', // web-marketplace (alternative)
      ];

  // CORS origin function: allow only specific origins
  const corsOriginFunction = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow if origin is in allowed list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  };

  // In production, use strict origin checking
  // In development, allow all for easier testing
  const corsOrigin = process.env.NODE_ENV === 'production' 
    ? corsOriginFunction
    : '*';

  // Handle OPTIONS preflight requests - must return 200 with correct headers, JSON Content-Type, and no HTML
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin as string | undefined;
      
      // Set CORS headers
      if (origin) {
        if (process.env.NODE_ENV === 'production') {
          // In production, only allow if origin is in allowed list
          if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
          }
        } else {
          // In development, allow any origin
          res.setHeader('Access-Control-Allow-Origin', origin || '*');
        }
      }
      
      // Allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      
      // Allow headers: Authorization, Content-Type, X-Tenant
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Tenant, x-tenant-id, x-tenant');
      
      // Credentials: true (explicitly enabled)
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Preflight must return 200 with JSON Content-Type, and no HTML
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ ok: true });
      return;
    }
    next();
  });

  // Enable CORS with exact configuration from CORS-CHECK.md
  app.enableCors({
    origin: corsOrigin,
    credentials: true, // Credentials: true (explicitly enabled)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allow methods
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Tenant', 'x-tenant-id', 'x-tenant'], // Allow headers
    preflightContinue: false,
    optionsSuccessStatus: 200, // Preflight must return 200
  });
  
  const resolvedPort = typeof port === "string" ? parseInt(port, 10) || 8080 : port;
  await app.listen(resolvedPort, host);
  Logger.log(`🚀 API listening on :${resolvedPort}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://${host}:${resolvedPort}/v1`, "Bootstrap");
}

bootstrap();
