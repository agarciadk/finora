import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { mapColumns, normalizeHeader } from '../parsing/column-mapping';
import { normalizeImportRow } from '../parsing/normalize-import-row';
import { ImportParsingError } from '../errors/import-parsing.error';
import type { ImportFile } from '../types/import-file.type';
import type { ImportedTransaction } from '../types/imported-transaction.type';
import type { TransactionImporter } from './transaction-importer.interface';

const ZIP_MAGIC_BYTES = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const MAX_HEADER_SEARCH_ROWS = 10;

type CellValue = string | number | Date | null;

function cellToValue(raw: ExcelJS.CellValue): CellValue {
  if (raw === null || raw === undefined) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' || typeof raw === 'string') return raw;
  if (typeof raw === 'boolean') return String(raw);
  if (typeof raw === 'object') {
    if ('result' in raw) return cellToValue(raw.result);
    if ('text' in raw) return String(raw.text);
    if ('richText' in raw) {
      return raw.richText.map((part) => part.text).join('');
    }
  }
  return null;
}

function rowHeaders(row: ExcelJS.Row): string[] {
  const headers: string[] = [];
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const value = cellToValue(cell.value);
    headers[colNumber] = value === null ? '' : String(value);
  });
  return headers;
}

type SheetLayout = {
  worksheet: ExcelJS.Worksheet;
  headerRowNumber: number;
  columnIndexes: Partial<
    Record<
      'date' | 'description' | 'amount' | 'charge' | 'credit' | 'balance',
      number
    >
  >;
  dataRowCount: number;
};

function findLayout(worksheet: ExcelJS.Worksheet): SheetLayout | null {
  const lastRow = Math.min(worksheet.rowCount, MAX_HEADER_SEARCH_ROWS);

  for (let rowNumber = 1; rowNumber <= lastRow; rowNumber += 1) {
    const headers = rowHeaders(worksheet.getRow(rowNumber));
    const nonEmptyHeaders = headers.filter(
      (h): h is string => typeof h === 'string' && h !== '',
    );
    if (nonEmptyHeaders.length === 0) continue;

    const mapping = mapColumns(nonEmptyHeaders);
    const hasAmountSource =
      mapping.amount ?? (mapping.charge || mapping.credit);
    if (!mapping.date || !hasAmountSource) continue;

    const columnIndexes: SheetLayout['columnIndexes'] = {};
    for (const [column, headerText] of Object.entries(mapping)) {
      const index = headers.findIndex(
        (h) =>
          typeof h === 'string' &&
          h !== '' &&
          normalizeHeader(h) === normalizeHeader(headerText),
      );
      if (index !== -1) {
        columnIndexes[column as keyof SheetLayout['columnIndexes']] = index;
      }
    }

    return {
      worksheet,
      headerRowNumber: rowNumber,
      columnIndexes,
      dataRowCount: Math.max(worksheet.rowCount - rowNumber, 0),
    };
  }

  return null;
}

@Injectable()
export class XlsxTransactionImporter implements TransactionImporter {
  readonly name = 'GenericXlsxImporter';

  // eslint-disable-next-line @typescript-eslint/require-await
  async canParse(file: ImportFile): Promise<boolean> {
    const hasXlsxExtension = file.originalName.toLowerCase().endsWith('.xlsx');
    return (
      hasXlsxExtension && file.buffer.subarray(0, 4).equals(ZIP_MAGIC_BYTES)
    );
  }

  async parse(file: ImportFile): Promise<ImportedTransaction[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);

    // Pick the sheet most likely to hold the movements: the one with a
    // recognizable header row and the most data rows underneath it.
    let bestLayout: SheetLayout | null = null;
    for (const worksheet of workbook.worksheets) {
      const layout = findLayout(worksheet);
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

    const { worksheet, headerRowNumber, columnIndexes } = bestLayout;
    const rows: ImportedTransaction[] = [];
    let rowNumber = 0;

    for (let r = headerRowNumber + 1; r <= worksheet.rowCount; r += 1) {
      const row = worksheet.getRow(r);
      if (row.cellCount === 0) continue;

      const getValue = (index: number | undefined): CellValue =>
        index === undefined ? null : cellToValue(row.getCell(index).value);

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
      rows.push(
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

    return rows;
  }
}
