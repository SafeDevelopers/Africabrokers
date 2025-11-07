import { Controller, Get, HttpCode, HttpStatus, HttpException } from "@nestjs/common";
import { AppService } from "./app.service";
import { Roles } from "../tenancy/roles.guard";
import { RequireTenant } from "../tenancy/tenant.guard";
import { HealthService } from "../health/health.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthService: HealthService,
  ) {}

  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }

  @Get("_status")
  @Roles('TENANT_ADMIN', 'AGENT') // Require admin role
  @RequireTenant() // Require tenant context
  async getStatus() {
    return this.appService.getStatus();
  }

  // CapRover health endpoints
  @Get("healthz")
  @HttpCode(HttpStatus.OK)
  async healthz() {
    return { ok: true };
  }

  @Get("readiness")
  @HttpCode(HttpStatus.OK)
  async readiness() {
    const result = await this.healthService.checkReadiness();
    // Return 200 if all checks pass, otherwise return 503
    if (result.status === 'UP') {
      return { ok: true, ...result };
    }
    // Return 503 for readiness failures (but still JSON)
    throw new HttpException(
      { ok: false, ...result },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
