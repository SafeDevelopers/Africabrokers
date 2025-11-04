import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';
import { InquiriesService } from './inquiries.service';
import { Roles } from '../tenancy/roles.guard';
import { IdorGuard, RequireIdorProtection } from '../security/idor.guard';

// Zod schemas for validation
const createInquirySchema = z.object({
  listingId: z.string().uuid(),
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1).max(2000),
  captchaToken: z.string().optional(), // For hCaptcha/Turnstile verification
});

const updateInquirySchema = z.object({
  status: z.enum(['NEW', 'READ', 'ARCHIVED']).optional(),
  brokerNotes: z.string().max(5000).optional(),
});

@Controller()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  /**
   * POST /v1/public/inquiries
   * Create a new inquiry (public endpoint)
   */
  @Post('public/inquiries')
  async createInquiry(@Req() req: Request, @Body() body: unknown) {
    const tenantId = (req as any).tenantId || 'et-addis';
    
    // Validate input
    const validated = createInquirySchema.parse(body);
    
    // TODO: Verify captcha token server-side
    // if (validated.captchaToken) {
    //   const isValid = await verifyCaptcha(validated.captchaToken);
    //   if (!isValid) {
    //     throw new BadRequestException('Invalid captcha token');
    //   }
    // }

    // Get listing and broker info
    const listingInfo = await this.inquiriesService.getListingWithBroker(
      validated.listingId,
      tenantId,
    );

    // Create inquiry
    const inquiry = await this.inquiriesService.createInquiry({
      tenantId,
      listingId: validated.listingId,
      brokerUserId: listingInfo.brokerUserId,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      message: validated.message,
      source: 'LISTING_DETAIL',
    });

    // TODO: Send notification to broker (email/n8n webhook)
    // await sendInquiryNotification({
    //   inquiryId: inquiry.id,
    //   brokerEmail: listingInfo.broker.email,
    //   inquiryData: validated,
    // });

    return { id: inquiry.id };
  }

  /**
   * GET /v1/broker/inquiries
   * Get inquiries for authenticated broker
   */
  @Get('broker/inquiries')
  @Roles('BROKER')
  async getInquiries(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('q') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.inquiriesService.getInquiriesByBroker(userId, tenantId, {
      status,
      search,
      page,
      limit,
    });
  }

  /**
   * GET /v1/broker/inquiries/:id
   * Get inquiry detail
   */
  @Get('broker/inquiries/:id')
  @Roles('BROKER')
  @RequireIdorProtection('Inquiry')
  @UseGuards(IdorGuard)
  async getInquiry(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.inquiriesService.getInquiryById(id, userId, tenantId);
  }

  /**
   * PATCH /v1/broker/inquiries/:id
   * Update inquiry (status, notes)
   */
  @Patch('broker/inquiries/:id')
  @Roles('BROKER')
  @RequireIdorProtection('Inquiry')
  @UseGuards(IdorGuard)
  async updateInquiry(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const validated = updateInquirySchema.parse(body);

    return this.inquiriesService.updateInquiry(id, userId, tenantId, validated);
  }
}

