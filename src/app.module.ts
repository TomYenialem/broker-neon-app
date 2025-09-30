import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarListingsModule } from './car-listings/car-listings.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CarListingsModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
