import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const port = process.env.PORT || 4000;
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("v1");
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3004', 
      'http://localhost:3003', 
      'http://localhost:3006',
      // Add production domains
      process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://marketplace.afribrok.com',
      process.env.ADMIN_BASE_URL || 'https://admin.afribrok.com',
      // Allow mobile app requests (React Native uses specific origins)
      '*', // In production, restrict to specific mobile app origins
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant'],
  });
  
  const resolvedPort = typeof port === "string" ? parseInt(port, 10) || 4000 : port;
  await app.listen(resolvedPort);
  Logger.log(`🚀 Core API listening on port ${resolvedPort}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://localhost:${resolvedPort}/v1`, "Bootstrap");
}

bootstrap();
