import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { softDeleteExtension } from './extensions/soft-delete.extension';

function createExtendedClient() {
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  });

  return client.$extends(softDeleteExtension);
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

// Declaration merging: makes every existing `constructor(private prisma:
// PrismaService)` see the full soft-delete-aware model API (account,
// transaction, $transaction, ...) with no changes needed in those services.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface PrismaService extends ExtendedPrismaClient {}

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = createExtendedClient();

  constructor() {
    // Everything except this class's own members (onModuleInit/
    // onModuleDestroy) is forwarded to the extended client, so
    // `this.prisma.account.findMany(...)` etc. keep working unchanged.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- forwarding to the extended client, whose real type is exposed via the interface merge above
        return Reflect.get(target.client, prop);
      },
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
