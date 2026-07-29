import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll(month?: number, year?: number) {
    const userId = await this.currentUser.getUserId();

    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (month === undefined || year === undefined) {
      return budgets.map((budget) => ({ ...budget, spent: null }));
    }

    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(year, month, 1));

    return Promise.all(
      budgets.map(async (budget) => {
        const { _sum } = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: periodStart, lt: periodEnd },
          },
          _sum: { amount: true },
        });

        return { ...budget, spent: _sum.amount ?? 0 };
      }),
    );
  }

  async create(dto: CreateBudgetDto) {
    const userId = await this.currentUser.getUserId();
    await this.ensureCategoryBelongsToUser(userId, dto.categoryId);

    try {
      return await this.prisma.budget.create({
        data: { ...dto, userId },
        include: { category: true },
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error);
    }
  }

  async update(id: string, dto: UpdateBudgetDto) {
    const userId = await this.ensureOwnership(id);

    if (dto.categoryId) {
      await this.ensureCategoryBelongsToUser(userId, dto.categoryId);
    }

    try {
      return await this.prisma.budget.update({
        where: { id },
        data: dto,
        include: { category: true },
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error);
    }
  }

  async remove(id: string) {
    await this.ensureOwnership(id);

    await this.prisma.budget.delete({ where: { id } });
  }

  private mapUniqueConstraintError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(
        'A budget for that category and period already exists',
      );
    }

    return error;
  }

  private async ensureCategoryBelongsToUser(
    userId: string,
    categoryId: string,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new BadRequestException('Invalid categoryId');
    }
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const budget = await this.prisma.budget.findUnique({ where: { id } });

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    return userId;
  }
}
