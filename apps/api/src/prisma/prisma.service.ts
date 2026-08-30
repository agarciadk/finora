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

// The `tx` type Prisma's own (extended) `$transaction` callback overload
// receives, extracted structurally instead of re-declared by hand so it stays
// in sync automatically if the extension/model list ever changes.
export type PrismaTransactionClient = Parameters<
  ExtendedPrismaClient['$transaction']
>[0] extends (tx: infer Tx) => unknown
  ? Tx
  : never;

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

  // Dedicated wrapper (instead of relying on the Proxy-forwarded
  // `$transaction`) because calling a top-level client method through the
  // Proxy would bind `this` to the Proxy itself, not the real client — the
  // Prisma runtime's `$transaction` implementation breaks in that case. This
  // calls it directly on `this.client`, so `this` stays correctly bound, and
  // the interactive `tx` client passed to `fn` still carries the soft-delete
  // extension (Prisma extensions are transaction re-entrant).
  runInTransaction<T>(
    fn: (tx: PrismaTransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.client.$transaction(fn);
  }
}
