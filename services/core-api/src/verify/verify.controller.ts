import { Controller, Get, Param } from '@nestjs/common';
import { VerifyService } from './verify.service';

@Controller('verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Get(':qr_code')
  async verifyQrCode(@Param('qr_code') qrCode: string) {
    return this.verifyService.verifyQrCode(qrCode);
  }
}