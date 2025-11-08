import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const port = process.env.PORT || 3000;
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
  
  const resolvedPort = typeof port === "string" ? parseInt(port, 10) || 3000 : port;
  await app.listen(resolvedPort);
  Logger.log(`🚀 Core API listening on port ${resolvedPort}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://localhost:${resolvedPort}/v1`, "Bootstrap");
}

bootstrap();
