import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: {
    account: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    transaction: { findMany: jest.Mock };
  };
  let currentUser: { getUserId: jest.Mock };

  const userId = 'user-1';
  const accountId = 'account-1';
  // Fixed "now" so the day-by-day reconstruction is deterministic.
  const now = new Date('2026-08-30T12:00:00.000Z');

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);

    prisma = {
      account: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: { findMany: jest.fn().mockResolvedValue([]) },
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
      ],
    }).compile();

    service = module.get(AccountsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('findOne', () => {
    it('throws NotFoundException when the account does not belong to the user', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId: 'someone-else',
      });

      await expect(service.findOne(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the current balance as the average when there are no transactions in the window', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId,
        balance: '1000.00',
        interestRate: null,
        taxRate: null,
        interestPaymentDay: null,
      });

      const result = await service.findOne(accountId);

      expect(result.stats).toEqual({
        averageBalanceLast30Days: 1000,
        projectedNextInterestPayment: null,
        nextInterestPaymentDate: null,
      });
    });

    it('reconstructs the 30-day average balance by undoing transactions newer than each day', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId,
        balance: '1000.00',
        interestRate: null,
        taxRate: null,
        interestPaymentDay: null,
      });
      // A single +100 INCOME yesterday means today and yesterday both sit at
      // 1000, but every earlier day in the window must have been 900.
      prisma.transaction.findMany.mockResolvedValue([
        {
          date: new Date('2026-08-29T10:00:00.000Z'),
          amount: '100.00',
          type: 'INCOME',
        },
      ]);

      const result = await service.findOne(accountId);

      const expectedAverage = (1000 * 2 + 900 * 28) / 30;
      expect(result.stats.averageBalanceLast30Days).toBeCloseTo(
        expectedAverage,
        2,
      );
    });

    it('projects the next net interest payment using the average balance, rate and tax rate', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId,
        balance: '12000.00',
        interestRate: '3.00',
        taxRate: '19.00',
        interestPaymentDay: 1,
      });

      const result = await service.findOne(accountId);

      const expected = (12000 * 0.03 * (1 - 0.19)) / 12;
      expect(result.stats.projectedNextInterestPayment).toBeCloseTo(
        expected,
        2,
      );
      expect(result.stats.nextInterestPaymentDate).toBe('2026-09-01');
    });

    it('treats a missing taxRate as 0% when projecting interest', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId,
        balance: '1200.00',
        interestRate: '6.00',
        taxRate: null,
        interestPaymentDay: null,
      });

      const result = await service.findOne(accountId);

      expect(result.stats.projectedNextInterestPayment).toBeCloseTo(6, 2);
    });

    it('clamps the next interest payment date to the last day of shorter months', async () => {
      jest.setSystemTime(new Date('2026-02-20T12:00:00.000Z'));
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId,
        balance: '1000.00',
        interestRate: null,
        taxRate: null,
        interestPaymentDay: 31,
      });

      const result = await service.findOne(accountId);

      expect(result.stats.nextInterestPaymentDate).toBe('2026-02-28');
    });
  });
});
