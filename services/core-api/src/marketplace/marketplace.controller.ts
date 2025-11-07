import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  async getListings(
    @Req() req: Request,
    @Query('q') q?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    @Query('sort', new DefaultValuePipe('createdAt:desc')) sort?: string,
  ) {
    // Get tenantId from request (set by TenantContextMiddleware)
    const tenantId = (req as any).tenantId;
    
    if (!tenantId) {
      // Return empty results instead of error
      return { items: [], count: 0 };
    }

    // Parse sort parameter (format: "field:direction")
    const [sortField, sortDirection] = sort.split(':');
    const orderBy = sortDirection === 'asc' ? 'asc' : 'desc';

    return this.marketplaceService.getListings({
      tenantId,
      q,
      limit: Math.min(limit || 20, 100), // Cap at 100
      offset: offset || 0,
      sortField: sortField || 'createdAt',
      sortDirection: orderBy,
    });
  }
}

