import { Prisma } from '../../generated/prisma/client';

// Models that get soft-deleted instead of physically removed. Keep in sync
// with the `deletedAt` fields added in schema.prisma.
const SOFT_DELETE_MODELS = [
  'account',
  'transaction',
  'category',
  'budget',
  'recurringPayment',
] as const;

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

// Read operations that must never surface a soft-deleted row.
const EXCLUDE_DELETED_OPERATIONS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

// Prisma's `query`/`model` extension component types don't compose into a
// single handler shared across models/operations, so this internal-only
// extension is built and unit-tested against loosely-typed (`any`) args and
// cast once, at the single call site in prisma.service.ts, to whatever
// `$extends` expects.

function excludeDeletedQueryExtension() {
  return {
    $allOperations({
      operation,
      args,
      query,
    }: {
      operation: string;
      args: any;
      query: (args: any) => Promise<unknown>;
    }) {
      if (EXCLUDE_DELETED_OPERATIONS.has(operation)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- args is intentionally loosely typed, see note above
        args.where = { ...args.where, deletedAt: null };
      }

      return query(args);
    },
  };
}

type SoftDeleteDelegate = {
  update: (args: any) => unknown;
  updateMany: (args: any) => unknown;
};

type SoftDeleteModelDelegates = Record<SoftDeleteModel, SoftDeleteDelegate>;

function softDeleteModelExtension(delegate: SoftDeleteDelegate) {
  return {
    delete: (args: { where: unknown }) =>
      delegate.update({ where: args.where, data: { deletedAt: new Date() } }),
    deleteMany: (args: { where?: unknown } = {}) =>
      delegate.updateMany({
        where: args.where,
        data: { deletedAt: new Date() },
      }),
  };
}

// Builds the `$extends` config that turns `delete`/`deleteMany` into
// `update`/`updateMany` (setting `deletedAt`) and injects `deletedAt: null`
// into every read on the soft-deletable models. Takes the *unextended*
// client so the internal `update`/`updateMany` calls it issues don't
// recurse back into this same extension. Exported (instead of inlined)
// so it can be unit-tested with plain fake delegates, no real Prisma Client
// needed.
export function createSoftDeleteExtensionConfig(
  client: SoftDeleteModelDelegates,
) {
  const queryConfig = Object.fromEntries(
    SOFT_DELETE_MODELS.map((model) => [model, excludeDeletedQueryExtension()]),
  ) as Record<SoftDeleteModel, ReturnType<typeof excludeDeletedQueryExtension>>;

  const modelConfig = Object.fromEntries(
    SOFT_DELETE_MODELS.map((model) => [
      model,
      softDeleteModelExtension(client[model]),
    ]),
  ) as Record<SoftDeleteModel, ReturnType<typeof softDeleteModelExtension>>;

  return {
    name: 'soft-delete',
    query: queryConfig,
    model: modelConfig,
  };
}

// `Prisma.defineExtension` (rather than building the config object and
// passing it to `$extends` directly) is what lets TypeScript correctly
// infer the resulting extended client's type in prisma.service.ts.
export const softDeleteExtension = Prisma.defineExtension((client) =>
  client.$extends(createSoftDeleteExtensionConfig(client)),
);
