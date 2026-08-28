import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    transaction: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    account: { findUnique: jest.Mock };
    category: { findUnique: jest.Mock };
  };
  let currentUser: { getUserId: jest.Mock };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      account: { findUnique: jest.fn() },
      category: { findUnique: jest.fn() },
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
      ],
    }).compile();

    service = module.get(TransactionsService);
  });

  describe('findAll', () => {
    it('paginates using the requested page and limit (capped at 50 by the DTO)', async () => {
      prisma.transaction.count.mockResolvedValue(125);
      const query: FindTransactionsQueryDto = { page: 3, limit: 50 };

      const result = await service.findAll(query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 100, take: 50 }),
      );
      expect(result.meta).toEqual({
        total: 125,
        page: 3,
        limit: 50,
        totalPages: 3,
      });
    });

    it('defaults to page 1 and limit 10 when not provided', async () => {
      const query = Object.assign(new FindTransactionsQueryDto(), {});

      await service.findAll(query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('filters by the requested date range, scoped to the current user', async () => {
      const query: FindTransactionsQueryDto = {
        page: 1,
        limit: 10,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };

      await service.findAll(query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            date: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-01-31T23:59:59.999Z'),
            },
          },
        }),
      );
    });

    it('filters by a case-insensitive search on the description', async () => {
      const query: FindTransactionsQueryDto = {
        page: 1,
        limit: 10,
        search: 'super',
      };

      await service.findAll(query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            description: { contains: 'super', mode: 'insensitive' },
          },
        }),
      );
    });

    it('filters by one or more account ids', async () => {
      const query: FindTransactionsQueryDto = {
        page: 1,
        limit: 10,
        accountIds: ['acc-1', 'acc-2'],
      };

      await service.findAll(query);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            accountId: { in: ['acc-1', 'acc-2'] },
          },
        }),
      );
    });
  });

  describe('updateCategory', () => {
    it('updates the category once ownership of both records is verified', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: 't1', userId });
      prisma.category.findUnique.mockResolvedValue({ id: 'c1', userId });
      prisma.transaction.update.mockResolvedValue({
        id: 't1',
        categoryId: 'c1',
      });

      const result = await service.updateCategory('t1', { categoryId: 'c1' });

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { category: { connect: { id: 'c1' } } },
        include: { account: true, category: true },
      });
      expect(result).toEqual({ id: 't1', categoryId: 'c1' });
    });

    it('throws NotFoundException when the transaction does not belong to the user', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 't1',
        userId: 'other-user',
      });

      await expect(
        service.updateCategory('t1', { categoryId: 'c1' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the category does not belong to the user', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: 't1', userId });
      prisma.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId: 'other-user',
      });

      await expect(
        service.updateCategory('t1', { categoryId: 'c1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('bulkUpdateCategory', () => {
    it('reassigns the category once every transaction and the category are verified', async () => {
      prisma.transaction.count.mockResolvedValue(2);
      prisma.category.findUnique.mockResolvedValue({ id: 'c1', userId });
      prisma.transaction.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkUpdateCategory({
        transactionIds: ['t1', 't2'],
        categoryId: 'c1',
      });

      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { id: { in: ['t1', 't2'] }, userId },
      });
      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['t1', 't2'] }, userId },
        data: { categoryId: 'c1' },
      });
      expect(result).toEqual({ updated: 2 });
    });

    it('throws NotFoundException when one of the transactions does not belong to the user', async () => {
      prisma.transaction.count.mockResolvedValue(1);

      await expect(
        service.bulkUpdateCategory({
          transactionIds: ['t1', 't2'],
          categoryId: 'c1',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the category does not belong to the user', async () => {
      prisma.transaction.count.mockResolvedValue(2);
      prisma.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId: 'other-user',
      });

      await expect(
        service.bulkUpdateCategory({
          transactionIds: ['t1', 't2'],
          categoryId: 'c1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('bulkUpdateAccount', () => {
    it('reassigns the account once every transaction and the account are verified', async () => {
      prisma.transaction.count.mockResolvedValue(2);
      prisma.account.findUnique.mockResolvedValue({ id: 'a1', userId });
      prisma.transaction.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkUpdateAccount({
        transactionIds: ['t1', 't2'],
        accountId: 'a1',
      });

      expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['t1', 't2'] }, userId },
        data: { accountId: 'a1' },
      });
      expect(result).toEqual({ updated: 2 });
    });

    it('throws BadRequestException when the account does not belong to the user', async () => {
      prisma.transaction.count.mockResolvedValue(2);
      prisma.account.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'other-user',
      });

      await expect(
        service.bulkUpdateAccount({
          transactionIds: ['t1', 't2'],
          accountId: 'a1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('bulkRemove', () => {
    it('soft-deletes every transaction once ownership is verified', async () => {
      prisma.transaction.count.mockResolvedValue(2);

      const result = await service.bulkRemove({
        transactionIds: ['t1', 't2'],
      });

      expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['t1', 't2'] }, userId },
      });
      expect(result).toEqual({ deleted: 2 });
    });

    it('throws NotFoundException when one of the transactions does not belong to the user', async () => {
      prisma.transaction.count.mockResolvedValue(1);

      await expect(
        service.bulkRemove({ transactionIds: ['t1', 't2'] }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.deleteMany).not.toHaveBeenCalled();
    });
  });
});
