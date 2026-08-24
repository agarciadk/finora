import { combineChargeAndCredit, parseAmount } from './amount.util';
import { parseImportDate } from './date.util';
import type { ImportedTransaction } from '../types/imported-transaction.type';

export type RawImportRow = {
  date?: string | number | Date | null;
  description?: string | null;
  amount?: string | number | null;
  charge?: string | number | null;
  credit?: string | number | null;
  balance?: string | number | null;
};

// Shared by every importer so date/amount parsing rules stay consistent
// regardless of the source format (CSV text vs. Excel cells).
export function normalizeImportRow(
  rowNumber: number,
  row: RawImportRow,
): ImportedTransaction {
  const errors: string[] = [];

  const date = parseImportDate(row.date ?? null);
  if (!date) {
    errors.push('Fecha no válida');
  }

  const description = (row.description ?? '').toString().trim();
  if (!description) {
    errors.push('Descripción vacía');
  }

  const hasAmountColumn = row.amount !== undefined && row.amount !== null;
  const amountResult = hasAmountColumn
    ? parseAmount(row.amount)
    : combineChargeAndCredit(row.charge, row.credit);

  if (amountResult.error) {
    errors.push(amountResult.error);
  } else if (amountResult.value === '0.00') {
    errors.push('El importe no puede ser cero');
  }

  const balanceResult =
    row.balance === undefined || row.balance === null || row.balance === ''
      ? { value: null }
      : parseAmount(row.balance);

  return {
    rowNumber,
    date,
    description,
    amount: amountResult.value,
    balance: balanceResult.value,
    errors,
  };
}
