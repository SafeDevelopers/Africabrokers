import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { BrokersService } from './brokers.service';

export class CreateBrokerDto {
  licenseNumber!: string;
  businessName?: string;
}

export class SubmitBrokerDto {
  documentUrls!: {
    licenseUrl: string;
    idUrl: string;
    selfieUrl: string;
  };
}

export class ReviewDecisionDto {
  decision!: 'approved' | 'denied' | 'needs_more_info';
  notes?: string;
}

@Controller('brokers')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Post()
  async createBroker(@Body() dto: CreateBrokerDto) {
    return this.brokersService.createBroker(dto);
  }

  @Post(':id/submit')
  async submitBroker(@Param('id') id: string, @Body() dto: SubmitBrokerDto) {
    return this.brokersService.submitForReview(id, dto);
  }

  @Get(':id')
  async getBroker(@Param('id') id: string) {
    return this.brokersService.getBrokerById(id);
  }

  @Post(':id/documents')
  async requestDocumentUrls(@Param('id') id: string) {
    return this.brokersService.requestDocumentUrls(id);
  }
}