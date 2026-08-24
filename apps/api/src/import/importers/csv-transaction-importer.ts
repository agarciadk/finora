import { Injectable } from '@nestjs/common';
import Papa from 'papaparse';
import { decodeBuffer } from '../parsing/encoding.util';
import { mapColumns } from '../parsing/column-mapping';
import { normalizeImportRow } from '../parsing/normalize-import-row';
import { ImportParsingError } from '../errors/import-parsing.error';
import type { ImportFile } from '../types/import-file.type';
import type { ImportedTransaction } from '../types/imported-transaction.type';
import type { TransactionImporter } from './transaction-importer.interface';

const ZIP_MAGIC_BYTES = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

@Injectable()
export class CsvTransactionImporter implements TransactionImporter {
  readonly name = 'GenericCsvImporter';

  // Interface requires a Promise (other importers do await I/O); this one
  // is fully synchronous.
  // eslint-disable-next-line @typescript-eslint/require-await
  async canParse(file: ImportFile): Promise<boolean> {
    if (file.buffer.subarray(0, 4).equals(ZIP_MAGIC_BYTES)) {
      // XLSX files are ZIP archives; never mistake one for a CSV.
      return false;
    }

    const hasCsvExtension = file.originalName.toLowerCase().endsWith('.csv');
    if (!hasCsvExtension) {
      return false;
    }

    const text = decodeBuffer(file.buffer);
    const sample = Papa.parse(text.slice(0, 4096), { preview: 5 });
    return (
      sample.data.length > 0 &&
      !sample.errors.some((e) => e.type === 'Delimiter')
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(file: ImportFile): Promise<ImportedTransaction[]> {
    const text = decodeBuffer(file.buffer);
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    const fields = result.meta.fields ?? [];
    if (fields.length === 0 || result.data.length === 0) {
      return [];
    }

    const columns = mapColumns(fields);
    const hasAmountSource =
      columns.amount ?? (columns.charge || columns.credit);
    if (!columns.date || !hasAmountSource) {
      throw new ImportParsingError(
        'No se han reconocido las columnas de fecha e importe en el archivo CSV',
      );
    }

    return result.data.map((record, index) =>
      normalizeImportRow(index + 1, {
        date: columns.date ? record[columns.date] : null,
        description: columns.description ? record[columns.description] : '',
        amount: columns.amount ? record[columns.amount] : null,
        charge: columns.charge ? record[columns.charge] : null,
        credit: columns.credit ? record[columns.credit] : null,
        balance: columns.balance ? record[columns.balance] : null,
      }),
    );
  }
}
