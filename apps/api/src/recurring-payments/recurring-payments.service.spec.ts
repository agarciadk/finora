import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecurringPaymentsService } from './recurring-payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';

describe('RecurringPaymentsService', () => {
  let service: RecurringPaymentsService;
  let prisma: {
    recurringPayment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    account: { findUnique: jest.Mock };
    category: { findUnique: jest.Mock };
    transaction: { create: jest.Mock };
    runInTransaction: jest.Mock;
  };
  let currentUser: { getUserId: jest.Mock };

  const userId = 'user-1';
  const recurringPaymentId = 'recurring-1';

  beforeEach(async () => {
    prisma = {
      recurringPayment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      account: { findUnique: jest.fn() },
      category: { findUnique: jest.fn() },
      transaction: { create: jest.fn().mockResolvedValue({ id: 'txn-1' }) },
      runInTransaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringPaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
      ],
    }).compile();

    service = module.get(RecurringPaymentsService);
  });

  describe('create', () => {
    it('rejects an accountId that does not belong to the user', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'account-1',
        userId: 'someone-else',
      });
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-1',
        userId,
      });

      await expect(
        service.create({
          accountId: 'account-1',
          categoryId: 'category-1',
          name: 'Netflix',
          amount: 15.99,
          type: 'EXPENSE',
          frequency: 'MONTHLY',
          startDate: '2026-01-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('sets nextPaymentDate equal to startDate on creation', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'account-1',
        userId,
      });
      prisma.category.findUnique.mockResolvedValue({
        id: 'category-1',
        userId,
      });
      prisma.recurringPayment.create.mockResolvedValue({ id: 'new-id' });

      await service.create({
        accountId: 'account-1',
        categoryId: 'category-1',
        name: 'Netflix',
        amount: 15.99,
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        startDate: '2026-01-15',
      });

      const [{ data }] = prisma.recurringPayment.create.mock.calls[0] as [
        { data: { startDate: Date; nextPaymentDate: Date } },
      ];
      expect(data.nextPaymentDate).toEqual(data.startDate);
    });
  });

  describe('execute', () => {
    const baseRecurringPayment = {
      id: recurringPaymentId,
      userId,
      accountId: 'account-1',
      categoryId: 'category-1',
      name: 'Netflix',
      amount: '15.99',
      type: 'EXPENSE' as const,
      frequency: 'MONTHLY' as const,
      startDate: new Date('2026-01-15T00:00:00.000Z'),
      nextPaymentDate: new Date('2026-01-15T00:00:00.000Z'),
      isActive: true,
    };

    it('throws NotFoundException when the recurring payment does not belong to the user', async () => {
      prisma.recurringPayment.findUnique.mockResolvedValue({
        ...baseRecurringPayment,
        userId: 'someone-else',
      });

      await expect(service.execute(recurringPaymentId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when the recurring payment is paused', async () => {
      prisma.recurringPayment.findUnique.mockResolvedValue({
        ...baseRecurringPayment,
        isActive: false,
      });

      await expect(service.execute(recurringPaymentId, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates a transaction from the recurring payment and advances nextPaymentDate', async () => {
      prisma.recurringPayment.findUnique.mockResolvedValue(
        baseRecurringPayment,
      );
      prisma.recurringPayment.update.mockResolvedValue({
        ...baseRecurringPayment,
        nextPaymentDate: new Date('2026-02-15T00:00:00.000Z'),
      });

      const result = await service.execute(recurringPaymentId, {
        date: '2026-01-16',
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          accountId: 'account-1',
          categoryId: 'category-1',
          description: 'Netflix',
          amount: '15.99',
          type: 'EXPENSE',
          date: new Date('2026-01-16'),
        },
        include: { account: true, category: true },
      });

      expect(prisma.recurringPayment.update).toHaveBeenCalledWith({
        where: { id: recurringPaymentId },
        data: { nextPaymentDate: new Date('2026-02-15T00:00:00.000Z') },
        include: { account: true, category: true },
      });
      expect(result.recurringPayment.nextPaymentDate).toEqual(
        new Date('2026-02-15T00:00:00.000Z'),
      );
    });
  });
});
