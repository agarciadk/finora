// Excel's day-0 epoch is 1899-12-30 (it treats 1900 as a leap year, a
// historical bug we don't need to replicate for dates past 1900).
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const ISO_DATE_REGEX = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
const EU_DATE_REGEX = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;

function fromParts(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  // JS silently rolls over invalid dates (e.g. 31/02 -> 03/03); reject those
  // instead of importing a wrong date.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

// Parses dates coming from bank exports (CSV strings, Excel serial numbers,
// or Excel cells already converted to JS Date objects) into a UTC midnight
// `Date`, avoiding local-timezone shifts.
export function parseImportDate(
  raw: string | number | Date | null | undefined,
): Date | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      return null;
    }
    return fromParts(raw.getFullYear(), raw.getMonth() + 1, raw.getDate());
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw <= 0) {
      return null;
    }
    return new Date(EXCEL_EPOCH_MS + Math.round(raw) * MS_PER_DAY);
  }

  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  const isoMatch = ISO_DATE_REGEX.exec(trimmed);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return fromParts(Number(year), Number(month), Number(day));
  }

  const euMatch = EU_DATE_REGEX.exec(trimmed);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    return fromParts(Number(year), Number(month), Number(day));
  }

  return null;
}
