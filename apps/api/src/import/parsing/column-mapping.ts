export type ImportColumn =
  'date' | 'description' | 'amount' | 'charge' | 'credit' | 'balance';

// Header aliases accepted across Spanish/English bank exports. Adding a new
// bank whose export uses different headers just means adding entries here
// (or, if the layout is too different, writing a dedicated importer).
const COLUMN_ALIASES: Record<ImportColumn, string[]> = {
  date: ['fecha', 'date', 'fecha valor', 'fecha operacion'],
  description: [
    'concepto',
    'descripcion',
    'description',
    'detalle',
    'movimiento',
  ],
  amount: ['importe', 'amount', 'importe eur'],
  charge: ['cargo', 'debe'],
  credit: ['abono', 'haber'],
  balance: ['saldo', 'balance'],
};

export function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Maps a row's raw headers to canonical column names. Returns a lookup from
// canonical column -> original header key, so callers can read values from
// the original record.
export function mapColumns(
  headers: string[],
): Partial<Record<ImportColumn, string>> {
  const mapping: Partial<Record<ImportColumn, string>> = {};

  for (const header of headers) {
    const normalized = normalizeHeader(header);

    for (const [column, aliases] of Object.entries(COLUMN_ALIASES) as [
      ImportColumn,
      string[],
    ][]) {
      if (mapping[column]) continue;
      if (aliases.includes(normalized)) {
        mapping[column] = header;
      }
    }
  }

  return mapping;
}
