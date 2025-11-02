import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  async liveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  async readiness() {
    return this.healthService.checkReadiness();
  }
}