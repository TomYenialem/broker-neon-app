import { Module } from '@nestjs/common';
import { CarListingsService } from './car-listings.service';
import { CarListingsController } from './car-listings.controller';

@Module({
  controllers: [CarListingsController],
  providers: [CarListingsService],
})
export class CarListingsModule {}
