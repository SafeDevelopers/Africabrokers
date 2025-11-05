import { Controller, Get, Param, Query } from '@nestjs/common';
import { VerifyService } from './verify.service';

@Controller('verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Get(':qr_code')
  async verifyQrCode(
    @Param('qr_code') qrCode: string,
    @Query('signature') signature?: string,
    @Query('ttl') ttl?: string,
  ) {
    const ttlNumber = ttl ? parseInt(ttl, 10) : undefined;
    return this.verifyService.verifyQrCode(qrCode, signature, ttlNumber);
  }
}