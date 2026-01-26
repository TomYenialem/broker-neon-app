// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

type GlobalPrisma = typeof globalThis & { __prisma?: PrismaClient };
const globalPrisma = globalThis as GlobalPrisma;

function logLevels(): Prisma.LogLevel[] {
  if (process.env.NODE_ENV === 'production') {
    return ['warn', 'error'];
  }
  return ['query', 'info', 'warn', 'error'];
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor(configService: ConfigService) {
    if (!globalPrisma.__prisma) {
      const databaseUrl = configService.get<string>('DATABASE_URL');
      globalPrisma.__prisma = new PrismaClient({
        log: logLevels(),
        datasources: databaseUrl
          ? {
              db: {
                url: databaseUrl,
              },
            }
          : undefined,
      });
    }

    this.client = globalPrisma.__prisma;

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop === 'client') {
          return target.client;
        }

        if (typeof prop === 'symbol' || Reflect.has(target, prop)) {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === 'function' ? value.bind(target) : value;
        }

        const prismaValue = Reflect.get(target.client, prop, target.client);
        return typeof prismaValue === 'function'
          ? (prismaValue as (...args: unknown[]) => unknown).bind(target.client)
          : prismaValue;
      },
    });
  }

  async onModuleInit() {
    await this.client.$connect();
    console.log('Connected to the database');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}

export interface PrismaService extends PrismaClient {}
