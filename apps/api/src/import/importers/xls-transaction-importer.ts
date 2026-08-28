import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { mapColumns, normalizeHeader } from '../parsing/column-mapping';
import { normalizeImportRow } from '../parsing/normalize-import-row';
import { ImportParsingError } from '../errors/import-parsing.error';
import type { ImportFile } from '../types/import-file.type';
import type { ImportedTransaction } from '../types/imported-transaction.type';
import type { TransactionImporter } from './transaction-importer.interface';

// Legacy `.xls` files are OLE2/CFBF compound documents, not ZIP archives
// (that's what distinguishes them from `.xlsx`, which is a ZIP under the hood).
const OLE_MAGIC_BYTES = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);
const MAX_HEADER_SEARCH_ROWS = 10;

type CellValue = string | number | Date | null;
type SheetRow = CellValue[];

function cellToValue(raw: unknown): CellValue {
  if (raw === null || raw === undefined || raw === '') return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' || typeof raw === 'string') return raw;
  if (typeof raw === 'boolean') return String(raw);
  return null;
}

type SheetLayout = {
  rows: SheetRow[];
  headerRowIndex: number;
  columnIndexes: Partial<
    Record<
      'date' | 'description' | 'amount' | 'charge' | 'credit' | 'balance',
      number
    >
  >;
  dataRowCount: number;
};

function findLayout(rows: SheetRow[]): SheetLayout | null {
  const lastRow = Math.min(rows.length, MAX_HEADER_SEARCH_ROWS);

  for (let rowIndex = 0; rowIndex < lastRow; rowIndex += 1) {
    const headers = (rows[rowIndex] ?? []).map((cell) =>
      cell === null ? '' : String(cell),
    );
    const nonEmptyHeaders = headers.filter((header) => header !== '');
    if (nonEmptyHeaders.length === 0) continue;

    const mapping = mapColumns(nonEmptyHeaders);
    const hasAmountSource =
      mapping.amount ?? (mapping.charge || mapping.credit);
    if (!mapping.date || !hasAmountSource) continue;

    const columnIndexes: SheetLayout['columnIndexes'] = {};
    for (const [column, headerText] of Object.entries(mapping) as [
      keyof SheetLayout['columnIndexes'],
      string,
    ][]) {
      const index = headers.findIndex(
        (header) =>
          header !== '' &&
          normalizeHeader(header) === normalizeHeader(headerText),
      );
      if (index !== -1) columnIndexes[column] = index;
    }

    return {
      rows,
      headerRowIndex: rowIndex,
      columnIndexes,
      dataRowCount: Math.max(rows.length - rowIndex - 1, 0),
    };
  }

  return null;
}

// Handles legacy `.xls` exports (e.g. Santander) via SheetJS, since `exceljs`
// (used by `XlsxTransactionImporter`) only supports the modern `.xlsx` format.
@Injectable()
export class XlsTransactionImporter implements TransactionImporter {
  readonly name = 'GenericXlsImporter';

  // eslint-disable-next-line @typescript-eslint/require-await
  async canParse(file: ImportFile): Promise<boolean> {
    const hasXlsExtension = file.originalName.toLowerCase().endsWith('.xls');
    return (
      hasXlsExtension &&
      file.buffer.subarray(0, OLE_MAGIC_BYTES.length).equals(OLE_MAGIC_BYTES)
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(file: ImportFile): Promise<ImportedTransaction[]> {
    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    // Pick the sheet most likely to hold the movements: the one with a
    // recognizable header row and the most data rows underneath it.
    let bestLayout: SheetLayout | null = null;
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const rows = XLSX.utils
        .sheet_to_json<unknown[]>(worksheet, {
          header: 1,
          raw: true,
          defval: null,
        })
        .map((row) => row.map(cellToValue));

      const layout = findLayout(rows);
      if (!layout) continue;
      if (!bestLayout || layout.dataRowCount > bestLayout.dataRowCount) {
        bestLayout = layout;
      }
    }

    if (!bestLayout) {
      throw new ImportParsingError(
        'No se ha encontrado ninguna hoja con columnas de fecha e importe reconocibles',
      );
    }

    const { rows, headerRowIndex, columnIndexes } = bestLayout;
    const result: ImportedTransaction[] = [];
    let rowNumber = 0;

    for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
      const row = rows[i] ?? [];
      const getValue = (index: number | undefined): CellValue =>
        index === undefined ? null : (row[index] ?? null);

      const description = getValue(columnIndexes.description);
      const date = getValue(columnIndexes.date);
      const hasAnyValue = [
        date,
        description,
        getValue(columnIndexes.amount),
        getValue(columnIndexes.charge),
        getValue(columnIndexes.credit),
      ].some((value) => value !== null && value !== '');
      if (!hasAnyValue) continue;

      rowNumber += 1;
      result.push(
        normalizeImportRow(rowNumber, {
          date,
          description: description === null ? '' : String(description),
          amount: getValue(columnIndexes.amount) as string | number | null,
          charge: getValue(columnIndexes.charge) as string | number | null,
          credit: getValue(columnIndexes.credit) as string | number | null,
          balance: getValue(columnIndexes.balance) as string | number | null,
        }),
      );
    }

    return result;
  }
}
