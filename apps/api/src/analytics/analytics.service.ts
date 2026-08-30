import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';

type MonthStats = {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
};

export type MonthlyEvolution = {
  month: string;
  income: number;
  expenses: number;
  savingsRate: number;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async getAnalytics(month: number, year: number) {
    const userId = await this.currentUser.getUserId();

    const current = await this.computeMonthStats(userId, month, year);
    const previousDate = new Date(Date.UTC(year, month - 2, 1));
    const previous = await this.computeMonthStats(
      userId,
      previousDate.getUTCMonth() + 1,
      previousDate.getUTCFullYear(),
    );

    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(year, month, 1));

    const categoryTotals = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: periodStart, lt: periodEnd },
      },
      _sum: { amount: true },
    });

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryTotals.map((entry) => entry.categoryId) } },
    });

    const spendingByCategory = categoryTotals
      .map((entry) => {
        const category = categories.find(
          (item) => item.id === entry.categoryId,
        );
        const amount = Number(entry._sum.amount ?? 0);

        return {
          categoryId: entry.categoryId,
          category: category?.name ?? '',
          amount,
          percentage:
            current.expenses > 0
              ? Math.round((amount / current.expenses) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      income: current.income,
      expenses: current.expenses,
      savingsRate: Math.round(current.savingsRate),
      incomeTrend: this.calculateTrend(current.income, previous.income),
      expensesTrend: this.calculateTrend(current.expenses, previous.expenses),
      savingsRateTrend: this.calculateTrend(
        current.savingsRate,
        previous.savingsRate,
      ),
      spendingByCategory,
    };
  }

  async getEvolution(months: number): Promise<MonthlyEvolution[]> {
    const userId = await this.currentUser.getUserId();
    const now = new Date();
    const rangeStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1),
    );
    const rangeEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    // Single query for the whole window, aggregated in memory per month
    // bucket, instead of running two aggregate queries per month (N+1).
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: rangeStart, lt: rangeEnd } },
      select: { amount: true, type: true, date: true },
    });

    const buckets = new Map<string, { income: number; expenses: number }>();
    for (let i = 0; i < months; i++) {
      const bucketDate = new Date(
        Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth() + i, 1),
      );
      buckets.set(this.formatMonthKey(bucketDate), { income: 0, expenses: 0 });
    }

    for (const transaction of transactions) {
      const bucket = buckets.get(this.formatMonthKey(transaction.date));
      if (!bucket) {
        continue;
      }

      const amount = Number(transaction.amount);
      if (transaction.type === 'INCOME') {
        bucket.income += amount;
      } else {
        bucket.expenses += amount;
      }
    }

    return Array.from(buckets.entries()).map(
      ([month, { income, expenses }]) => {
        const savings = income - expenses;

        return {
          month,
          income,
          expenses,
          savingsRate: income > 0 ? Math.round((savings / income) * 100) : 0,
        };
      },
    );
  }

  private formatMonthKey(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private async computeMonthStats(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthStats> {
    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(year, month, 1));

    const [incomeAgg, expensesAgg] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: periodStart, lt: periodEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: periodStart, lt: periodEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expensesAgg._sum.amount ?? 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return { income, expenses, savings, savingsRate };
  }

  private calculateTrend(current: number, previous: number): number | null {
    if (previous === 0) {
      return null;
    }

    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  }
}
