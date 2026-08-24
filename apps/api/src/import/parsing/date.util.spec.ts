import { parseImportDate } from './date.util';

describe('parseImportDate', () => {
  it('parses ISO dates (YYYY-MM-DD)', () => {
    const date = parseImportDate('2026-03-15');
    expect(date?.toISOString().slice(0, 10)).toBe('2026-03-15');
  });

  it('parses DD/MM/YYYY dates', () => {
    const date = parseImportDate('15/03/2026');
    expect(date?.toISOString().slice(0, 10)).toBe('2026-03-15');
  });

  it('parses DD-MM-YYYY dates', () => {
    const date = parseImportDate('15-03-2026');
    expect(date?.toISOString().slice(0, 10)).toBe('2026-03-15');
  });

  it('rejects invalid calendar dates instead of rolling them over', () => {
    expect(parseImportDate('31/02/2026')).toBeNull();
  });

  it('rejects unparseable strings', () => {
    expect(parseImportDate('not a date')).toBeNull();
    expect(parseImportDate('')).toBeNull();
  });

  it('rejects null/undefined', () => {
    expect(parseImportDate(null)).toBeNull();
    expect(parseImportDate(undefined)).toBeNull();
  });

  it('converts JS Date objects (e.g. from Excel) to UTC midnight', () => {
    const excelDate = new Date(2026, 2, 15, 10, 30);
    const date = parseImportDate(excelDate);
    expect(date?.toISOString()).toBe('2026-03-15T00:00:00.000Z');
  });

  it('converts Excel serial date numbers', () => {
    // 46096 -> 2026-03-15 (Excel epoch is 1899-12-30).
    const date = parseImportDate(46096);
    expect(date?.toISOString().slice(0, 10)).toBe('2026-03-15');
  });
});
