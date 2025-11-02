import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MediaModule } from "./media.module";

async function bootstrap() {
  const port = process.env.MEDIA_PORT || "3001";
  const app = await NestFactory.create(MediaModule);
  app.setGlobalPrefix("v1");
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3004', 'http://localhost:3003', 'http://localhost:3006'],
    credentials: true,
  });
  
  await app.listen(parseInt(port, 10));
  Logger.log(`🚀 Media Service listening on port ${port}`, "Bootstrap");
  Logger.log(`📚 API Documentation: http://localhost:${port}/v1`, "Bootstrap");
}

bootstrap();
