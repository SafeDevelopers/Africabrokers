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
  
  // Enable CORS
  // Read allowed origins from environment variable or use defaults
  const corsAllowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
  const allowedOrigins = corsAllowedOriginsEnv
    ? corsAllowedOriginsEnv.split(',').map(origin => origin.trim())
    : [
        // Local development defaults
        'http://localhost:3000', // web-admin (default Next.js port)
        'http://localhost:3004', // web-admin (alternative port)
        'http://localhost:3003', // web-marketplace
        'http://localhost:3006',
        // Production domains
        'https://afribrok.com',
        'https://www.afribrok.com',
        'https://admin.afribrok.com',
      ];

  // In production, allow only specific origins
  // In development, allow all for easier testing
  const corsOrigin = process.env.NODE_ENV === 'production' 
    ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        // Allow if origin is in allowed list
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Reject other origins in production
        callback(new Error('Not allowed by CORS'));
      }
    : '*';

  // Handle OPTIONS preflight requests to return 200 JSON (before CORS)
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      // Set CORS headers
      if (origin) {
        if (process.env.NODE_ENV === 'production') {
          if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
          }
        } else {
          res.setHeader('Access-Control-Allow-Origin', origin || '*');
        }
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id, x-tenant');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ ok: true });
      return;
    }
    next();
  });

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });
  
  const resolvedPort = typeof port === "string" ? parseInt(port, 10) || 3000 : port;
  await app.listen(resolvedPort);
  Logger.log(`🚀 Core API listening on port ${resolvedPort}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://localhost:${resolvedPort}/v1`, "Bootstrap");
}

bootstrap();
