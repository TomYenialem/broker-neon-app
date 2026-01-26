import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CacheModule.register({ ttl: 30 })],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
