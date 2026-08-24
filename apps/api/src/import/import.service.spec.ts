import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { ImporterRegistryService } from './importers/importer-registry.service';
import { TransactionType } from '../generated/prisma/enums';
import type { ConfirmImportDto } from './dto/confirm-import.dto';

describe('ImportService', () => {
  let service: ImportService;
  let prisma: {
    account: { findUnique: jest.Mock };
    category: { findMany: jest.Mock };
    transaction: { findMany: jest.Mock; createMany: jest.Mock };
  };
  let currentUser: { getUserId: jest.Mock };
  let registry: { resolve: jest.Mock };

  const userId = 'user-1';
  const accountId = 'account-1';

  beforeEach(async () => {
    prisma = {
      account: { findUnique: jest.fn() },
      category: { findMany: jest.fn() },
      transaction: { findMany: jest.fn(), createMany: jest.fn() },
    };
    currentUser = { getUserId: jest.fn().mockResolvedValue(userId) };
    registry = { resolve: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: prisma },
        { provide: CurrentUserService, useValue: currentUser },
        { provide: ImporterRegistryService, useValue: registry },
      ],
    }).compile();

    service = module.get(ImportService);
  });

  describe('preview', () => {
    const file = {
      originalname: 'movimientos.csv',
      mimetype: 'text/csv',
      buffer: Buffer.from('irrelevant'),
    };

    it('rejects when the account does not belong to the current user', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId: 'someone-else',
      });

      await expect(service.preview(accountId, file)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects when the account does not exist', async () => {
      prisma.account.findUnique.mockResolvedValue(null);

      await expect(service.preview(accountId, file)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects when no file is provided', async () => {
      await expect(
        service.preview(accountId, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('flags rows that match an existing transaction as duplicates', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: accountId, userId });
      prisma.transaction.findMany.mockResolvedValue([
        {
          date: new Date('2026-03-01T00:00:00.000Z'),
          amount: { toFixed: () => '25.50' },
          type: TransactionType.EXPENSE,
          description: 'Supermercado',
        },
      ]);
      registry.resolve.mockResolvedValue({
        parse: jest.fn().mockResolvedValue([
          {
            rowNumber: 1,
            date: new Date('2026-03-01T00:00:00.000Z'),
            description: 'Supermercado',
            amount: '-25.50',
            balance: null,
            errors: [],
          },
          {
            rowNumber: 2,
            date: new Date('2026-03-02T00:00:00.000Z'),
            description: 'Nomina',
            amount: '1500.00',
            balance: null,
            errors: [],
          },
        ]),
      });

      const result = await service.preview(accountId, file);

      expect(result.totalRows).toBe(2);
      expect(result.duplicateRows).toBe(1);
      expect(result.validRows).toBe(1);
      expect(
        result.transactions.find((t) => t.description === 'Supermercado')
          ?.status,
      ).toBe('duplicate');
      expect(
        result.transactions.find((t) => t.description === 'Nomina')?.status,
      ).toBe('valid');
    });

    it('counts rows with parse errors as invalid', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: accountId, userId });
      prisma.transaction.findMany.mockResolvedValue([]);
      registry.resolve.mockResolvedValue({
        parse: jest.fn().mockResolvedValue([
          {
            rowNumber: 1,
            date: null,
            description: 'Sin fecha',
            amount: null,
            balance: null,
            errors: ['Fecha no válida'],
          },
        ]),
      });

      const result = await service.preview(accountId, file);

      expect(result.invalidRows).toBe(1);
      expect(result.validRows).toBe(0);
    });
  });

  describe('confirm', () => {
    const baseDto: ConfirmImportDto = {
      transactions: [
        {
          date: '2026-03-01',
          description: 'Compra',
          amount: '-25.50',
          categoryId: 'category-1',
        },
      ],
    };

    it('rejects when the account does not belong to the current user', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: accountId,
        userId: 'someone-else',
      });

      await expect(service.confirm(accountId, baseDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('creates only valid, non-duplicate transactions using the resolved category', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: accountId, userId });
      prisma.category.findMany.mockResolvedValue([{ id: 'category-1' }]);
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.createMany.mockResolvedValue({ count: 1 });

      const result = await service.confirm(accountId, baseDto);

      expect(prisma.transaction.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            userId,
            accountId,
            categoryId: 'category-1',
            description: 'Compra',
            amount: '25.50',
            type: TransactionType.EXPENSE,
          }),
        ],
      });
      expect(result).toEqual({ imported: 1, duplicates: 0, invalid: 0 });
    });

    it('rejects rows using a category that does not belong to the user', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: accountId, userId });
      prisma.category.findMany.mockResolvedValue([]);
      prisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.confirm(accountId, baseDto);

      expect(prisma.transaction.createMany).not.toHaveBeenCalled();
      expect(result).toEqual({ imported: 0, duplicates: 0, invalid: 1 });
    });

    it('skips rows that duplicate an existing transaction', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: accountId, userId });
      prisma.category.findMany.mockResolvedValue([{ id: 'category-1' }]);
      prisma.transaction.findMany.mockResolvedValue([
        {
          date: new Date('2026-03-01T00:00:00.000Z'),
          amount: { toFixed: () => '25.50' },
          type: TransactionType.EXPENSE,
          description: 'Compra',
        },
      ]);

      const result = await service.confirm(accountId, baseDto);

      expect(prisma.transaction.createMany).not.toHaveBeenCalled();
      expect(result).toEqual({ imported: 0, duplicates: 1, invalid: 0 });
    });
  });
});
