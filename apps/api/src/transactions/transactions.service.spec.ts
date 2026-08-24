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
    };
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
      },
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
});
