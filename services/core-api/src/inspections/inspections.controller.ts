import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { InspectionsService, CreateInspectionDto, InspectionQuery } from './inspections.service';

// Temporary mock guard - replace with real auth guard later
const mockAuthGuard = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Mock user from request header for now
    // TODO: Replace with real Keycloak OIDC auth guard
  };
};

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  async createInspection(
    @Req() req: any,
    @Body() dto: CreateInspectionDto,
  ) {
    // TODO: Get userId and tenantId from authenticated request
    // For now, using mock values - replace with real auth
    const userId = req.headers['x-user-id'] || 'mock-inspector-id';
    const tenantId = req.headers['x-tenant-id'] || 'ethiopia-addis';

    if (!userId || userId === 'mock-inspector-id') {
      return {
        error: 'Authentication required',
        message: 'Please authenticate using Keycloak OIDC',
      };
    }

    return this.inspectionsService.createInspection(userId, tenantId, dto);
  }

  @Get()
  async getInspections(
    @Req() req: any,
    @Query() query: InspectionQuery,
  ) {
    // TODO: Get userId from authenticated request
    const userId = req.headers['x-user-id'] || 'mock-inspector-id';

    if (!userId || userId === 'mock-inspector-id') {
      return {
        error: 'Authentication required',
        message: 'Please authenticate using Keycloak OIDC',
      };
    }

    return this.inspectionsService.getInspections(userId, query);
  }

  @Get(':id')
  async getInspectionById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    // TODO: Get userId from authenticated request
    const userId = req.headers['x-user-id'] || 'mock-inspector-id';

    if (!userId || userId === 'mock-inspector-id') {
      return {
        error: 'Authentication required',
        message: 'Please authenticate using Keycloak OIDC',
      };
    }

    return this.inspectionsService.getInspectionById(id, userId);
  }
}

