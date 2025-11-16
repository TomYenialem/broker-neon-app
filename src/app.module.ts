import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CarListingsModule } from './car-listings/car-listings.module';
import { LandListingsModule } from './land-listings/land-listings.module';
import { HouseListingsModule } from './house-listings/house-listings.module';
import { MachineListingsModule } from './machine-listings/machine-listings.module';
import { ListingsModule } from './listings/listings.module';
import { TranslateModule } from './translate/translate.module';
import { UploadModule } from 'uploads/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    ListingsModule,
    CarListingsModule,
    LandListingsModule,
    HouseListingsModule,
    MachineListingsModule,
    TranslateModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
