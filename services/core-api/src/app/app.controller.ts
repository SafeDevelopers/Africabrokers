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

  // GET /v1/_status → return JSON summary of services, version, and time
  // Accessible to SUPER_ADMIN, TENANT_ADMIN, and AGENT
  @Get("_status")
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'AGENT') // Allow SUPER_ADMIN, TENANT_ADMIN, and AGENT
  @RequireTenant() // Require tenant context (SUPER_ADMIN can override)
  async getStatus() {
    return this.appService.getStatus();
  }

  // CapRover health endpoint
  // GET /healthz → respond 200 JSON: { ok: true, version: process.env.APP_VERSION || 'dev', uptimeSec: process.uptime() }
  @Get("healthz")
  @HttpCode(HttpStatus.OK)
  async healthz() {
    return {
      ok: true,
      version: process.env.APP_VERSION || process.env.GIT_SHA || process.env.VERSION || 'dev',
      uptimeSec: Math.floor(process.uptime()),
    };
  }

  // GET /readiness → verify DB + Redis connectivity
  // If OK → 200 JSON { ok:true, db:true, redis:true }, else 503 JSON with details
  @Get("readiness")
  @HttpCode(HttpStatus.OK)
  async readiness() {
    const result = await this.healthService.checkReadiness();
    // Return 200 if all checks pass, otherwise return 503
    if (result.status === 'UP') {
      return {
        ok: true,
        db: result.checks?.database === 'UP',
        redis: result.checks?.redis === 'UP' || result.checks?.redis === 'SKIPPED',
        ...result,
      };
    }
    // Return 503 for readiness failures (but still JSON)
    throw new HttpException(
      {
        ok: false,
        db: result.checks?.database === 'UP',
        redis: result.checks?.redis === 'UP' || result.checks?.redis === 'SKIPPED',
        ...result,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
