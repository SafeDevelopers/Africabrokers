import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PublicBrokersService } from './public-brokers.service';

@Controller('public/brokers')
export class PublicBrokersController {
  constructor(private readonly publicBrokersService: PublicBrokersService) {}

  @Get()
  async getPublicBrokers(
    @Req() req: Request,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
    @Query('city') city?: string,
  ) {
    // Limit cannot exceed 100
    if (limit > 100) {
      limit = 100;
    }

    // Get tenantId from request (set by TenantContextMiddleware)
    const tenantId = (req as any).tenantId || 'et-addis';

    return this.publicBrokersService.getPublicBrokers({
      limit,
      offset,
      search,
      city,
      tenantId,
    });
  }

  @Get(':id')
  async getPublicBrokerById(@Req() req: Request, @Param('id') id: string) {
    // Get tenantId from request (set by TenantContextMiddleware)
    const tenantId = (req as any).tenantId || 'et-addis';

    const broker = await this.publicBrokersService.getPublicBrokerById(id, tenantId);
    
    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    return broker;
  }
}

