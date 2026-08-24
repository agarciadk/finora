import { createSoftDeleteExtensionConfig } from './soft-delete.extension';

type FakeDelegate = {
  findMany: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
};

function createFakeClient() {
  const makeDelegate = (): FakeDelegate => ({
    findMany: jest.fn(),
    update: jest
      .fn()
      .mockResolvedValue({ id: 'entity-1', deletedAt: new Date() }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  });

  return {
    account: makeDelegate(),
    transaction: makeDelegate(),
    category: makeDelegate(),
    budget: makeDelegate(),
  };
}

describe('createSoftDeleteExtensionConfig', () => {
  it('converts delete into an update that sets deletedAt', async () => {
    const client = createFakeClient();
    const extension = createSoftDeleteExtensionConfig(client);

    await extension.model.account.delete({ where: { id: 'account-1' } });

    expect(client.account.update).toHaveBeenCalledWith({
      where: { id: 'account-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() is typed as `any` in @types/jest
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('converts deleteMany into an updateMany that sets deletedAt', async () => {
    const client = createFakeClient();
    const extension = createSoftDeleteExtensionConfig(client);

    await extension.model.transaction.deleteMany({
      where: { accountId: 'account-1' },
    });

    expect(client.transaction.updateMany).toHaveBeenCalledWith({
      where: { accountId: 'account-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any() is typed as `any` in @types/jest
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('injects deletedAt: null into read operations', async () => {
    const client = createFakeClient();
    const extension = createSoftDeleteExtensionConfig(client);
    const query = jest.fn().mockResolvedValue([]);

    await extension.query.category.$allOperations({
      operation: 'findMany',
      args: { where: { userId: 'user-1' } },
      query,
    });

    expect(query).toHaveBeenCalledWith({
      where: { userId: 'user-1', deletedAt: null },
    });
  });

  it('leaves non-read operations untouched', async () => {
    const client = createFakeClient();
    const extension = createSoftDeleteExtensionConfig(client);
    const query = jest.fn().mockResolvedValue({ id: 'budget-1' });
    const args = { data: { limit: 100 } };

    await extension.query.budget.$allOperations({
      operation: 'create',
      args,
      query,
    });

    expect(query).toHaveBeenCalledWith(args);
  });
});
