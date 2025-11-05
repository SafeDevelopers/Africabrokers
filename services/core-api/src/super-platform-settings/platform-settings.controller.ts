import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Roles } from '../tenancy/roles.guard';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsDto } from './platform-settings.dto';
import { TwoFactorGuard } from './platform-settings.guards';
import { IpAllowlistGuard } from './platform-settings.guards';

@Controller('super/platform-settings')
@Roles('SUPER_ADMIN')
@UseGuards(TwoFactorGuard, IpAllowlistGuard)
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  @Get()
  async get() {
    return this.platformSettingsService.get();
  }

  @Put()
  async put(@Body() dto: PlatformSettingsDto, @Request() req: any) {
    const user = req.user;
    if (!user || !user.id) {
      throw new BadRequestException('User ID is required');
    }

    return this.platformSettingsService.put(dto as any, user.id);
  }

  @Get('audit')
  async audit(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.platformSettingsService.audit(limit || 50, offset || 0);
  }
}

