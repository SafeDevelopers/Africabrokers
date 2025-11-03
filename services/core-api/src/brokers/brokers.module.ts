import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';
import { PublicBrokersController } from './public-brokers.controller';
import { PublicBrokersService } from './public-brokers.service';

@Module({
  controllers: [BrokersController, PublicBrokersController],
  providers: [BrokersService, PublicBrokersService],
  exports: [BrokersService, PublicBrokersService],
})
export class BrokersModule {}