import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionType } from '../generated/prisma/enums';
import { CurrentUserService } from '../common/current-user/current-user.service';
import {
  PrismaService,
  type PrismaTransactionClient,
} from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Name of the fallback category transactions/budgets get reassigned to when
// their own category is deleted (see `remove()`).
const FALLBACK_CATEGORY_NAME = 'Otros';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
  ) {}

  async findAll() {
    const userId = await this.currentUser.getUserId();

    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto) {
    const userId = await this.currentUser.getUserId();

    await this.ensureNameIsAvailable(userId, dto.name);

    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const userId = await this.ensureOwnership(id);

    if (dto.name) {
      await this.ensureNameIsAvailable(userId, dto.name, id);
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const userId = await this.currentUser.getUserId();

    await this.prisma.runInTransaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id } });

      if (!category || category.userId !== userId) {
        throw new NotFoundException('Category not found');
      }

      const fallback = await this.getOrCreateFallbackCategory(
        tx,
        userId,
        category,
      );

      await tx.transaction.updateMany({
        where: { userId, categoryId: category.id },
        data: { categoryId: fallback.id },
      });

      await this.reassignBudgets(tx, userId, category.id, fallback.id);

      await tx.category.delete({ where: { id: category.id } });
    });
  }

  // Finds the user's "Otros" category matching the deleted category's type,
  // creating it if it doesn't exist yet. Excludes the category being deleted
  // itself (relevant when deleting "Otros" and it isn't duplicated), so a
  // fresh one is created to replace it rather than reassigning to itself.
  private async getOrCreateFallbackCategory(
    tx: PrismaTransactionClient,
    userId: string,
    category: { id: string; type: TransactionType },
  ) {
    const existing = await tx.category.findFirst({
      where: {
        userId,
        name: FALLBACK_CATEGORY_NAME,
        type: category.type,
        NOT: { id: category.id },
      },
    });

    if (existing) {
      return existing;
    }

    return tx.category.create({
      data: { userId, name: FALLBACK_CATEGORY_NAME, type: category.type },
    });
  }

  // Reassigns every budget pointing to the deleted category to the fallback
  // one. A budget is unique per (userId, categoryId, month, year), so a
  // budget can't simply be moved when the fallback already has one for the
  // same period — in that case the duplicate is soft-deleted instead of
  // reassigned, since the fallback's own budget already covers that period.
  private async reassignBudgets(
    tx: PrismaTransactionClient,
    userId: string,
    fromCategoryId: string,
    toCategoryId: string,
  ) {
    const budgets = await tx.budget.findMany({
      where: { userId, categoryId: fromCategoryId },
    });

    for (const budget of budgets) {
      const conflict = await tx.budget.findFirst({
        where: {
          userId,
          categoryId: toCategoryId,
          month: budget.month,
          year: budget.year,
        },
      });

      if (conflict) {
        await tx.budget.delete({ where: { id: budget.id } });
      } else {
        await tx.budget.update({
          where: { id: budget.id },
          data: { categoryId: toCategoryId },
        });
      }
    }
  }

  private async ensureNameIsAvailable(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { userId, name, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });

    if (existing) {
      throw new ConflictException('A category with that name already exists');
    }
  }

  private async ensureOwnership(id: string) {
    const userId = await this.currentUser.getUserId();
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return userId;
  }
}
