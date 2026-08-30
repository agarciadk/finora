import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let tx: {
    category: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
    transaction: { updateMany: jest.Mock };
    budget: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let prisma: { runInTransaction: jest.Mock };
  let currentUser: { getUserId: jest.Mock };

  const userId = 'user-1';

  beforeEach(async () => {
    tx = {
      category: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      transaction: { updateMany: jest.fn() },
      budget: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    prisma = {
      runInTransaction: jest.fn(
        (fn: (transactionClient: typeof tx) => unknown) => fn(tx),
      ),
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  describe('remove', () => {
    it('throws NotFoundException when the category does not belong to the user', async () => {
      tx.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId: 'other-user',
        type: 'EXPENSE',
      });

      await expect(service.remove('c1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the category does not exist', async () => {
      tx.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('c1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('reassigns transactions and budgets to the existing "Otros" category and soft-deletes the requested one', async () => {
      tx.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId,
        type: 'EXPENSE',
      });
      tx.category.findFirst.mockResolvedValue({ id: 'otros', userId });
      tx.budget.findMany.mockResolvedValue([
        { id: 'b1', month: 1, year: 2026 },
      ]);
      tx.budget.findFirst.mockResolvedValue(null);

      await service.remove('c1');

      expect(tx.category.create).not.toHaveBeenCalled();
      expect(tx.transaction.updateMany).toHaveBeenCalledWith({
        where: { userId, categoryId: 'c1' },
        data: { categoryId: 'otros' },
      });
      expect(tx.budget.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { categoryId: 'otros' },
      });
      expect(tx.budget.delete).not.toHaveBeenCalled();
      expect(tx.category.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('creates the "Otros" category (matching the deleted category type) when it does not exist yet', async () => {
      tx.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId,
        type: 'INCOME',
      });
      tx.category.findFirst.mockResolvedValue(null);
      tx.category.create.mockResolvedValue({ id: 'new-otros', userId });

      await service.remove('c1');

      expect(tx.category.create).toHaveBeenCalledWith({
        data: { userId, name: 'Otros', type: 'INCOME' },
      });
      expect(tx.transaction.updateMany).toHaveBeenCalledWith({
        where: { userId, categoryId: 'c1' },
        data: { categoryId: 'new-otros' },
      });
    });

    it('soft-deletes a budget instead of reassigning it when "Otros" already has one for the same period (unique constraint)', async () => {
      tx.category.findUnique.mockResolvedValue({
        id: 'c1',
        userId,
        type: 'EXPENSE',
      });
      tx.category.findFirst.mockResolvedValue({ id: 'otros', userId });
      tx.budget.findMany.mockResolvedValue([
        { id: 'b1', month: 3, year: 2026 },
      ]);
      tx.budget.findFirst.mockResolvedValue({ id: 'existing-otros-budget' });

      await service.remove('c1');

      expect(tx.budget.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
      expect(tx.budget.update).not.toHaveBeenCalled();
    });

    it('excludes the category being deleted from the "Otros" lookup, so deleting "Otros" itself regenerates it', async () => {
      tx.category.findUnique.mockResolvedValue({
        id: 'otros-id',
        userId,
        type: 'EXPENSE',
        name: 'Otros',
      });
      tx.category.findFirst.mockResolvedValue(null);
      tx.category.create.mockResolvedValue({ id: 'new-otros-id', userId });

      await service.remove('otros-id');

      expect(tx.category.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          name: 'Otros',
          type: 'EXPENSE',
          NOT: { id: 'otros-id' },
        },
      });
      expect(tx.transaction.updateMany).toHaveBeenCalledWith({
        where: { userId, categoryId: 'otros-id' },
        data: { categoryId: 'new-otros-id' },
      });
    });
  });
});
