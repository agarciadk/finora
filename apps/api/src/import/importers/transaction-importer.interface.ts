import type { ImportFile } from '../types/import-file.type';
import type { ImportedTransaction } from '../types/imported-transaction.type';

// Contract every format/bank-specific importer must implement. Adding support
// for a new bank means adding a new class that implements this interface and
// registering it in `import.module.ts` — nothing else in the import flow
// needs to change.
export interface TransactionImporter {
  readonly name: string;
  canParse(file: ImportFile): Promise<boolean>;
  parse(file: ImportFile): Promise<ImportedTransaction[]>;
}

export const TRANSACTION_IMPORTERS = Symbol('TRANSACTION_IMPORTERS');
