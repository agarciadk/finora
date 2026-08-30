import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: {
    transaction: {
      findMany: jest.Mock;
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
    category: { findMany: jest.Mock };
  };
  let currentUser: { getUserId: jest.Mock };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      category: { findMany: jest.fn().mockResolvedValue([]) },
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  describe('getEvolution', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-30T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('runs a single query for the whole window instead of one per month', async () => {
      await service.getEvolution(6);

      expect(prisma.transaction.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.transaction.aggregate).not.toHaveBeenCalled();
    });

    it('returns one bucket per requested month, oldest to newest', async () => {
      const result = await service.getEvolution(3);

      expect(result).toEqual([
        { month: '2026-06', income: 0, expenses: 0, savingsRate: 0 },
        { month: '2026-07', income: 0, expenses: 0, savingsRate: 0 },
        { month: '2026-08', income: 0, expenses: 0, savingsRate: 0 },
      ]);
    });

    it('aggregates income/expenses per month and computes the savings rate', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        { amount: '1000', type: 'INCOME', date: new Date('2026-07-05') },
        { amount: '400', type: 'EXPENSE', date: new Date('2026-07-10') },
        { amount: '2000', type: 'INCOME', date: new Date('2026-08-01') },
        { amount: '500', type: 'EXPENSE', date: new Date('2026-08-15') },
      ]);

      const result = await service.getEvolution(2);

      expect(result).toEqual([
        { month: '2026-07', income: 1000, expenses: 400, savingsRate: 60 },
        { month: '2026-08', income: 2000, expenses: 500, savingsRate: 75 },
      ]);
    });

    it('scopes the query to the requested date range and the current user', async () => {
      await service.getEvolution(6);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          date: {
            gte: new Date(Date.UTC(2026, 2, 1)),
            lt: new Date(Date.UTC(2026, 8, 1)),
          },
        },
        select: { amount: true, type: true, date: true },
      });
    });
  });
});
