import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '../generated/prisma/enums';
import { ImporterRegistryService } from './importers/importer-registry.service';
import { ImportParsingError } from './errors/import-parsing.error';
import { buildDuplicateKey } from './duplicate-detection.util';
import type { ConfirmImportDto } from './dto/confirm-import.dto';
import type { ImportFile } from './types/import-file.type';
import type {
  ImportedTransaction,
  ImportPreviewResult,
  ImportPreviewRow,
  ImportRowStatus,
} from './types/imported-transaction.type';
import { parseImportDate } from './parsing/date.util';

type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUser: CurrentUserService,
    private readonly registry: ImporterRegistryService,
  ) {}

  async preview(
    accountId: string,
    file: UploadedFile | undefined,
  ): Promise<ImportPreviewResult> {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo');
    }

    const userId = await this.currentUser.getUserId();
    await this.ensureAccountOwnership(accountId, userId);

    const importFile: ImportFile = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    };

    const importer = await this.registry.resolve(importFile);

    let rows: ImportedTransaction[];
    try {
      rows = await importer.parse(importFile);
    } catch (error) {
      if (error instanceof ImportParsingError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }

    const existingKeys = await this.getExistingKeys(accountId, rows);
    const previewRows = this.markStatuses(accountId, rows, existingKeys);

    return this.summarize(file.originalname, previewRows);
  }

  async confirm(accountId: string, dto: ConfirmImportDto) {
    const userId = await this.currentUser.getUserId();
    await this.ensureAccountOwnership(accountId, userId);

    const categoryIds = [...new Set(dto.transactions.map((t) => t.categoryId))];
    const ownedCategories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds }, userId },
      select: { id: true },
    });
    const ownedCategoryIds = new Set(ownedCategories.map((c) => c.id));

    const rows: ImportedTransaction[] = dto.transactions.map((t, index) => {
      const errors: string[] = [];
      const date = parseImportDate(t.date);
      if (!date) errors.push('Fecha no válida');
      if (!ownedCategoryIds.has(t.categoryId)) {
        errors.push('Categoría no válida');
      }
      if (Number(t.amount) === 0) {
        errors.push('Importe no válido');
      }

      return {
        rowNumber: index + 1,
        date,
        description: t.description,
        amount: t.amount,
        balance: t.balance ?? null,
        errors,
      };
    });

    const existingKeys = await this.getExistingKeys(accountId, rows);
    const previewRows = this.markStatuses(accountId, rows, existingKeys);

    const validRows = previewRows.filter((row) => row.status === 'valid');
    const invalidRows = previewRows.filter((row) => row.status === 'invalid');
    const duplicateRows = previewRows.filter(
      (row) => row.status === 'duplicate',
    );

    const categoryByRow = new Map(
      dto.transactions.map((t, index) => [index + 1, t.categoryId]),
    );

    if (validRows.length > 0) {
      await this.prisma.transaction.createMany({
        data: validRows.map((row) => ({
          userId,
          accountId,
          categoryId: categoryByRow.get(row.rowNumber)!,
          description: row.description,
          amount: row.amount!.replace('-', ''),
          type:
            Number(row.amount) < 0
              ? TransactionType.EXPENSE
              : TransactionType.INCOME,
          date: row.date!,
        })),
      });
    }

    return {
      imported: validRows.length,
      duplicates: duplicateRows.length,
      invalid: invalidRows.length,
    };
  }

  private async ensureAccountOwnership(accountId: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== userId) {
      throw new NotFoundException('Account not found');
    }
  }

  private async getExistingKeys(
    accountId: string,
    rows: ImportedTransaction[],
  ): Promise<Set<string>> {
    const dates = rows
      .map((row) => row.date)
      .filter((date): date is Date => date !== null);

    if (dates.length === 0) {
      return new Set();
    }

    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));

    const existing = await this.prisma.transaction.findMany({
      where: { accountId, date: { gte: min, lte: max } },
      select: { date: true, amount: true, type: true, description: true },
    });

    return new Set(
      existing.map((t) =>
        buildDuplicateKey(
          accountId,
          t.date,
          `${t.type === TransactionType.EXPENSE ? '-' : ''}${t.amount.toFixed(2)}`,
          t.description,
        ),
      ),
    );
  }

  private markStatuses(
    accountId: string,
    rows: ImportedTransaction[],
    existingKeys: Set<string>,
  ): ImportPreviewRow[] {
    const seenInBatch = new Set<string>();

    return rows.map((row) => {
      const status = this.statusFor(accountId, row, existingKeys, seenInBatch);
      return { ...row, status };
    });
  }

  private statusFor(
    accountId: string,
    row: ImportedTransaction,
    existingKeys: Set<string>,
    seenInBatch: Set<string>,
  ): ImportRowStatus {
    if (row.errors.length > 0 || !row.date || !row.amount) {
      return 'invalid';
    }

    const key = buildDuplicateKey(
      accountId,
      row.date,
      row.amount,
      row.description,
    );

    if (existingKeys.has(key) || seenInBatch.has(key)) {
      return 'duplicate';
    }

    seenInBatch.add(key);
    return 'valid';
  }

  private summarize(
    fileName: string,
    rows: ImportPreviewRow[],
  ): ImportPreviewResult {
    const dates = rows
      .map((row) => row.date)
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      fileName,
      totalRows: rows.length,
      validRows: rows.filter((r) => r.status === 'valid').length,
      invalidRows: rows.filter((r) => r.status === 'invalid').length,
      duplicateRows: rows.filter((r) => r.status === 'duplicate').length,
      dateRange:
        dates.length > 0
          ? {
              from: dates[0].toISOString().slice(0, 10),
              to: dates[dates.length - 1].toISOString().slice(0, 10),
            }
          : null,
      transactions: rows,
    };
  }
}
