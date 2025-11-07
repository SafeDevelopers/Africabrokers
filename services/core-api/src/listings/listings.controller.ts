import { Controller, Post, Get, Query, Param, Body } from '@nestjs/common';
import { ListingsService } from './listings.service';

export class CreateListingDto {
  propertyId!: string;
  priceAmount!: number;
  priceCurrency!: string;
  availabilityStatus?: 'active' | 'pending_review';
  featured?: boolean;
}

export class SearchListingsDto {
  search?: string;
  propertyType?: 'residential' | 'commercial' | 'land';
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  availability?: 'active' | 'pending_review' | 'suspended';
  page?: number;
  limit?: number;
}

export class InquiryDto {
  name!: string;
  email!: string;
  phone?: string;
  message!: string;
}

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  async createListing(@Body() dto: CreateListingDto) {
    return this.listingsService.createListing(dto);
  }

  @Get('search')
  async searchListings(@Query() query: SearchListingsDto) {
    try {
      return await this.listingsService.searchListings(query);
    } catch (error: any) {
      console.error('Controller error in searchListings:', error);
      // Return empty response on error
      return {
        listings: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  @Get(':id')
  async getListingById(@Param('id') id: string) {
    return this.listingsService.getListingById(id);
  }

  @Post(':id/inquiry')
  async submitInquiry(@Param('id') id: string, @Body() dto: InquiryDto) {
    return this.listingsService.submitInquiry(id, dto);
  }
}