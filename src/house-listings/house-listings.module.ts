import { Module } from '@nestjs/common';
import { HouseListingsService } from './house-listings.service';
import { HouseListingsController } from './house-listings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HouseListingsController],
  providers: [HouseListingsService],
})
export class HouseListingsModule {}


