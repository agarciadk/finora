// Common internal model every `TransactionImporter` normalizes its rows to,
// regardless of the source format (CSV, XLSX, and future bank-specific
// formats). `amount` is a signed decimal string (e.g. "-25.50") rather than a
// float, to avoid floating point rounding issues with money.
export type ImportedTransaction = {
  rowNumber: number;
  date: Date | null;
  description: string;
  amount: string | null;
  balance: string | null;
  errors: string[];
};

export type ImportRowStatus = 'valid' | 'invalid' | 'duplicate';

export type ImportPreviewRow = ImportedTransaction & {
  status: ImportRowStatus;
};

export type ImportPreviewResult = {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  dateRange: { from: string; to: string } | null;
  transactions: ImportPreviewRow[];
};
