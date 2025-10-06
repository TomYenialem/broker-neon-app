import { Module } from '@nestjs/common';
import { MachineListingsService } from './machine-listings.service';
import { MachineListingsController } from './machine-listings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MachineListingsController],
  providers: [MachineListingsService],
})
export class MachineListingsModule {}


