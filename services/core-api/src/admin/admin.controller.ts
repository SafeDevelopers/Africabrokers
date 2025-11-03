import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../tenancy/roles.guard';
import { RequireTenant } from '../tenancy/tenant.guard';
import { RequireIdorProtection, IdorGuard } from '../security/idor.guard';

@Controller('admin')
@Roles('TENANT_ADMIN', 'AGENT') // Only TENANT_ADMIN and AGENT can access
@RequireTenant() // Require tenant context
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // QR Codes routes
  @Get('qrcodes')
  async getQRCodes(@Query('limit', new DefaultValuePipe(60), ParseIntPipe) limit: number) {
    return this.adminService.getQRCodes(limit);
  }

  @Get('qrcodes/:id')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('QrCode')
  async getQRCodeById(@Param('id') id: string) {
    return this.adminService.getQRCodeById(id);
  }

  @Post('qrcodes/:id/activate')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('QrCode')
  async activateQRCode(@Param('id') id: string) {
    return this.adminService.activateQRCode(id);
  }

  @Post('qrcodes/:id/revoke')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('QrCode')
  async revokeQRCode(@Param('id') id: string) {
    return this.adminService.revokeQRCode(id);
  }

  // Brokers routes (placeholder - can be expanded)
  @Get('brokers')
  async getBrokers(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    // TODO: Implement broker listing for tenant admins
    return {
      items: [],
      total: 0,
      limit,
      offset,
      message: 'Broker listing endpoint - to be implemented',
    };
  }

  // Licenses routes (placeholder - can be expanded)
  @Get('licenses')
  async getLicenses(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    // TODO: Implement license listing for tenant admins
    return {
      items: [],
      total: 0,
      limit,
      offset,
      message: 'License listing endpoint - to be implemented',
    };
  }

  // Listings routes (placeholder - can be expanded)
  @Get('listings')
  async getListings(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    // TODO: Implement listing management for tenant admins
    return {
      items: [],
      total: 0,
      limit,
      offset,
      message: 'Listing management endpoint - to be implemented',
    };
  }
}

