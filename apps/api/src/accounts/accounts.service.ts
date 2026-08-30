import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { Account } from '../generated/prisma/client';
import type { AccountStatsDto } from './dto/account-stats.dto';

const AVERAGE_BALANCE_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

// Clamps `day` to the last valid day of the given month (e.g. `31` in
// February becomes the 28th/29th), since `interestPaymentDay` is a single
// 1-31 value meant to apply to every month regardless of its length.
function clampToMonth(year: number, month: number, day: number): Date {
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, month, Math.min(day, lastDayOfMonth)));
}

function getNextInterestPaymentDate(paymentDay: number, from: Date): Date {
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const thisMonthPayment = clampToMonth(year, month, paymentDay);

  if (thisMonthPayment.getTime() >= startOfUtcDay(from).getTime()) {
    return thisMonthPayment;
  }

  return clampToMonth(year, month + 1, paymentDay);
}

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await this.ensureOwnership(id);
    const stats = await this.calculateStats(account);

    return { ...account, stats };
  }

  async create(dto: CreateAccountDto) {
    const userId = await this.currentUser.getUserId();

    return this.prisma.account.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.ensureOwnership(id);

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.account.delete({ where: { id } });
  }

  // Reconstructs the account's end-of-day balance for each of the last 30
  // days from its current `balance` plus the transactions in that window
  // (there is no stored running ledger), then averages them. Transactions
  // are fetched once (already sorted newest-first by Prisma's default) and
  // consumed with a single cursor as `offset` walks backward from today, so
  // the whole reconstruction is O(transactions + 30) instead of re-scanning
  // the list for every day.
  private async calculateStats(account: Account): Promise<AccountStatsDto> {
    const now = new Date();
    const windowStart = startOfUtcDay(
      new Date(now.getTime() - (AVERAGE_BALANCE_WINDOW_DAYS - 1) * MS_PER_DAY),
    );

    const transactions = await this.prisma.transaction.findMany({
      where: { accountId: account.id, date: { gte: windowStart } },
      orderBy: { date: 'desc' },
      select: { date: true, amount: true, type: true },
    });

    const currentBalance = Number(account.balance);
    let cursor = 0;
    let netEffectSinceToday = 0;
    const dailyBalances: number[] = [];

    for (let offset = 0; offset < AVERAGE_BALANCE_WINDOW_DAYS; offset += 1) {
      const dayEnd = new Date(now.getTime() - offset * MS_PER_DAY);
      dayEnd.setUTCHours(23, 59, 59, 999);

      while (
        cursor < transactions.length &&
        transactions[cursor].date.getTime() > dayEnd.getTime()
      ) {
        const transaction = transactions[cursor];
        const signedAmount =
          transaction.type === 'INCOME'
            ? Number(transaction.amount)
            : -Number(transaction.amount);
        netEffectSinceToday += signedAmount;
        cursor += 1;
      }

      dailyBalances.push(currentBalance - netEffectSinceToday);
    }

    const averageBalanceLast30Days =
      dailyBalances.reduce((sum, balance) => sum + balance, 0) /
      dailyBalances.length;

    const interestRate =
      account.interestRate === null ? null : Number(account.interestRate);
    const taxRate = account.taxRate === null ? 0 : Number(account.taxRate);

    const projectedNextInterestPayment =
      interestRate === null
        ? null
        : roundToCents(
            (averageBalanceLast30Days *
              (interestRate / 100) *
              (1 - taxRate / 100)) /
              12,
          );

    const nextInterestPaymentDate =
      account.interestPaymentDay === null
        ? null
        : getNextInterestPaymentDate(account.interestPaymentDay, now)
            .toISOString()
            .slice(0, 10);

    return {
      averageBalanceLast30Days: roundToCents(averageBalanceLast30Days),
      projectedNextInterestPayment,
      nextInterestPaymentDate,
    };
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const account = await this.prisma.account.findUnique({ where: { id } });

    if (!account || account.userId !== userId) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }
}
