import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
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
import { InspectionsModule } from "../inspections/inspections.module";
import { AdminModule } from "../admin/admin.module";
import { SuperAdminModule } from "../superadmin/superadmin.module";
import { AuditModule } from "../audit/audit.module";
import { SecurityModule } from "../security/security.module";
import { JwtAuthMiddleware } from "../auth/jwt-auth.middleware";
import { RateLimitMiddleware } from "../security/rate-limit.middleware";
import { CsrfMiddleware } from "../security/csrf.middleware";
import { TenantContextMiddleware } from "../tenancy/tenant-context.middleware";
import { ReqScopeInterceptor } from "../tenancy/req-scope.interceptor";
import { RolesGuard } from "../tenancy/roles.guard";
import { TenantGuard } from "../tenancy/tenant.guard";

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
    InspectionsModule,
    AdminModule,
    SuperAdminModule,
    AuditModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Register guards globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    // Note: IdorGuard is applied per-route via @UseGuards decorator
    // rather than globally to avoid performance impact
    // Register interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqScopeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT auth middleware first (to populate req.user)
    consumer
      .apply(JwtAuthMiddleware)
      .forRoutes('*');
    
    // Then apply tenant context middleware (uses req.user)
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('*');
    
    // Apply rate limiting to admin routes (after auth)
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('/v1/admin/*', '/v1/superadmin/*');
    
    // Apply CSRF protection to admin POST/PUT/PATCH/DELETE (after rate limit)
    consumer
      .apply(CsrfMiddleware)
      .forRoutes('/v1/admin/*', '/v1/superadmin/*');
  }
}
