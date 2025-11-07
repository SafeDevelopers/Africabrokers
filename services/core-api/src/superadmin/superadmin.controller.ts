import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './superadmin.service';
import { Roles } from '../tenancy/roles.guard';
import { BrokerApplicationStatus } from '@prisma/client';

@Controller('superadmin')
@Roles('SUPER_ADMIN') // Only SUPER_ADMIN can access these routes
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  async getTenants(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.superAdminService.getTenants({ limit, offset });
  }

  @Get('overview')
  async getOverview() {
    return this.superAdminService.getOverview();
  }

  @Get('agents')
  async getAgentApplications(
    @Query('status') status?: BrokerApplicationStatus,
    @Query('tenantId') tenantId?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.superAdminService.getAgentApplications({
      status,
      tenantId,
      limit,
      offset,
    });
  }

  // This must come AFTER all specific routes (tenants, overview, agents)
  // Otherwise it will catch those routes first
  @Get('agents/:id')
  async getAgentApplicationById(@Param('id') id: string) {
    return this.superAdminService.getAgentApplicationById(id);
  }

  @Post('agents/:id/approve')
  async approveAgentApplication(@Param('id') id: string) {
    return this.superAdminService.approveAgentApplication(id);
  }

  @Post('agents/:id/reject')
  async rejectAgentApplication(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.superAdminService.rejectAgentApplication(id, body?.reason);
  }

  @Post('agents/:id/request-info')
  async requestMoreInfo(
    @Param('id') id: string,
    @Body() body?: { infoRequest?: string },
  ) {
    return this.superAdminService.requestMoreInfo(id, body?.infoRequest);
  }
}

