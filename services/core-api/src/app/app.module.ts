import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { BrokersModule } from "../brokers/brokers.module";
import { ListingsModule } from "../listings/listings.module";
import { ReviewsModule } from "../reviews/reviews.module";
import { VerifyModule } from "../verify/verify.module";
import { HealthModule } from "../health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    BrokersModule,
    ListingsModule,
    ReviewsModule,
    VerifyModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
