import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Request, Response, NextFunction } from "express";
import { MediaModule } from "./media.module";

async function bootstrap() {
  const port = process.env.MEDIA_PORT || "3000";
  const app = await NestFactory.create(MediaModule);
  app.setGlobalPrefix("v1");
  
  // Enable CORS - exactly match CORS-CHECK.md
  // Allow origins: admin + marketplace domains (and localhost dev if present)
  const corsAllowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
  const allowedOrigins = corsAllowedOriginsEnv
    ? corsAllowedOriginsEnv.split(',').map(origin => origin.trim())
    : [
        // Local development origins
        'http://localhost:3004', // web-admin (alternative port)
        'http://localhost:3003', // web-marketplace
        'http://localhost:3006',
        // Production domains: admin + marketplace
        'https://admin.afribrok.com', // web-admin
        'https://afribrok.com', // web-marketplace
        'https://market.afribrok.com', // web-marketplace (alternative)
      ];

  // Handle OPTIONS preflight requests - must return 200 with correct headers, JSON Content-Type, and no HTML
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin as string | undefined;
      
      // Set CORS headers
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      // Allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      
      // Allow headers: Authorization, Content-Type, X-Tenant
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Tenant, x-tenant-id, x-tenant');
      
      // Credentials: true (if app requires it)
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
    origin: allowedOrigins, // Allow origins: admin + marketplace domains (and localhost dev if present)
    credentials: true, // Credentials: true (if app requires it)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allow methods
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Tenant', 'x-tenant-id', 'x-tenant'], // Allow headers
    preflightContinue: false,
    optionsSuccessStatus: 200, // Preflight must return 200
  });
  
  await app.listen(parseInt(port, 10));
  Logger.log(`🚀 Media Service listening on port ${port}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://localhost:${port}/v1`, "Bootstrap");
}

bootstrap();
