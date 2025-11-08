import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
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
import { HealthService } from "../health/health.service";
import { InspectionsModule } from "../inspections/inspections.module";
import { AdminModule } from "../admin/admin.module";
import { SuperAdminModule } from "../superadmin/superadmin.module";
import { SuperPlatformSettingsModule } from "../super-platform-settings/platform-settings.module";
import { AuditModule } from "../audit/audit.module";
import { SecurityModule } from "../security/security.module";
import { BillingModule } from "../billing/billing.module";
import { PublicModule } from "../public/public.module";
import { InquiriesModule } from "../inquiries/inquiries.module";
import { StatusModule } from "../status/status.module";
import { MarketplaceModule } from "../marketplace/marketplace.module";
import { JwtAuthMiddleware } from "../auth/jwt-auth.middleware";
import { RateLimitMiddleware } from "../security/rate-limit.middleware";
import { CsrfMiddleware } from "../security/csrf.middleware";
import { TenantContextMiddleware } from "../tenancy/tenant-context.middleware";
import { InquiryRateLimitMiddleware } from "../inquiries/inquiry-rate-limit.middleware";
import { LeadRateLimitMiddleware } from "../public/lead-rate-limit.middleware";
import { AuditLoggingMiddleware } from "../audit/audit-logging.middleware";
import { ReqScopeInterceptor } from "../tenancy/req-scope.interceptor";
import { RolesGuard } from "../tenancy/roles.guard";
import { TenantGuard } from "../tenancy/tenant.guard";
import { HttpExceptionFilter } from "../common/http-exception.filter";
import { JsonResponseInterceptor } from "../common/json-response.interceptor";

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
    SuperPlatformSettingsModule,
    AuditModule,
    SecurityModule,
    BillingModule,
    PublicModule,
    InquiriesModule,
    StatusModule,
    MarketplaceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    HealthService,
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
    // Register interceptors globally
    {
      provide: APP_INTERCEPTOR,
      useClass: JsonResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqScopeInterceptor,
    },
    // Register global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
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
    
    // Apply rate limiting to public inquiries (after tenant context)
    // Note: Middleware is provided by InquiriesModule with DI
    consumer
      .apply(InquiryRateLimitMiddleware)
      .forRoutes('/v1/public/inquiries');
    
    // Apply rate limiting to public leads (after tenant context)
    // Note: Middleware is provided by PublicModule with DI
    consumer
      .apply(LeadRateLimitMiddleware)
      .forRoutes('/v1/public/leads/sell');
    
    // Apply CSRF protection to admin POST/PUT/PATCH/DELETE (after rate limit)
    consumer
      .apply(CsrfMiddleware)
      .forRoutes('/v1/admin/*', '/v1/superadmin/*');
    
    // Apply audit logging to admin routes (after all other middleware)
    consumer
      .apply(AuditLoggingMiddleware)
      .forRoutes('/v1/admin/*');
  }
}
