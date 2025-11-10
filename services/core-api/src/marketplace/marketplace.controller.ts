import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Req, Param, BadRequestException, Post, Body } from '@nestjs/common';
import { Request } from 'express';
import { MarketplaceService } from './marketplace.service';
import { Public } from '../auth/public.decorator';
import { InquiriesService } from '../inquiries/inquiries.service';

@Controller('v1/marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly inquiriesService: InquiriesService,
  ) {}

  @Public()
  @Get('listings')
  async list(
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
    const [sortField, sortDirection] = (sort || 'createdAt:desc').split(':');
    const orderBy = sortDirection === 'asc' ? 'asc' : 'desc';

    return this.marketplaceService.findMany(tenantId, {
      q,
      limit: Math.min(limit || 20, 100), // Cap at 100
      offset: offset || 0,
      sort: sort || 'createdAt:desc',
    });
  }

  @Public()
  @Get('listings/:id')
  async one(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    // Get tenantId from request (set by TenantContextMiddleware)
    const tenantId = (req as any).tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.marketplaceService.findOne(tenantId, id);
  }

  @Public()
  @Post('listings/:id/inquiries')
  async createInquiry(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { name: string; email?: string; phone?: string; message: string; },
  ) {
    const tenant = (req as any).tenantId;
    
    if (!tenant) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.inquiriesService.createInquiryFromListing(tenant, id, body);
  }
}

