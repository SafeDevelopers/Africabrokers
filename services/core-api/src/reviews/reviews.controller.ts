import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

export class ReviewDecisionDto {
  decision!: 'approved' | 'denied' | 'needs_more_info';
  notes?: string;
}

export class PaginationQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  status?: string;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('pending')
  async getPendingReviews(@Query() query: PaginationQuery) {
    return this.reviewsService.getPendingReviews(query);
  }

  @Post(':id/decision')
  async makeReviewDecision(@Param('id') id: string, @Body() dto: ReviewDecisionDto) {
    return this.reviewsService.makeReviewDecision(id, dto);
  }
}