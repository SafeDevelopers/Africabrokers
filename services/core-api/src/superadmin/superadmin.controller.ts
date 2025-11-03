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

@Controller('superadmin/agents')
@Roles('SUPER_ADMIN') // Only SUPER_ADMIN can access these routes
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get()
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

  @Get(':id')
  async getAgentApplicationById(@Param('id') id: string) {
    return this.superAdminService.getAgentApplicationById(id);
  }

  @Post(':id/approve')
  async approveAgentApplication(@Param('id') id: string) {
    return this.superAdminService.approveAgentApplication(id);
  }

  @Post(':id/reject')
  async rejectAgentApplication(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.superAdminService.rejectAgentApplication(id, body?.reason);
  }

  @Post(':id/request-info')
  async requestMoreInfo(
    @Param('id') id: string,
    @Body() body?: { infoRequest?: string },
  ) {
    return this.superAdminService.requestMoreInfo(id, body?.infoRequest);
  }
}

