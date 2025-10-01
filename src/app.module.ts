import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarListingsModule } from './car-listings/car-listings.module';
import { PrismaModule } from './prisma/prisma.module';
import { LandListingsModule } from './land-listings/land-listings.module';

@Module({
  imports: [CarListingsModule,PrismaModule, LandListingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
