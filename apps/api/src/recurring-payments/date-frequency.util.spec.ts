import { getNextOccurrence } from './date-frequency.util';

describe('getNextOccurrence', () => {
  it('advances weekly payments by exactly 7 days', () => {
    const current = new Date('2026-01-05T10:00:00.000Z');
    const startDate = new Date('2026-01-05T10:00:00.000Z');

    expect(getNextOccurrence('WEEKLY', current, startDate).toISOString()).toBe(
      '2026-01-12T10:00:00.000Z',
    );
  });

  it('advances monthly payments to the same day next month', () => {
    const current = new Date('2026-02-15T00:00:00.000Z');
    const startDate = new Date('2026-01-15T00:00:00.000Z');

    expect(getNextOccurrence('MONTHLY', current, startDate).toISOString()).toBe(
      '2026-03-15T00:00:00.000Z',
    );
  });

  it('clamps a day-31 anchor to the last day of a shorter month without drifting permanently', () => {
    const startDate = new Date('2026-01-31T00:00:00.000Z');

    // Jan 31 -> Feb (clamped to 28, 2026 isn't a leap year).
    const afterJanuary = getNextOccurrence('MONTHLY', startDate, startDate);
    expect(afterJanuary.toISOString()).toBe('2026-02-28T00:00:00.000Z');

    // Feb 28 -> March should still target the 31st (the anchor), not 28th + 1 month.
    const afterFebruary = getNextOccurrence('MONTHLY', afterJanuary, startDate);
    expect(afterFebruary.toISOString()).toBe('2026-03-31T00:00:00.000Z');

    // March 31 -> April (30 days) clamps again.
    const afterMarch = getNextOccurrence('MONTHLY', afterFebruary, startDate);
    expect(afterMarch.toISOString()).toBe('2026-04-30T00:00:00.000Z');
  });

  it('advances yearly payments to the same month/day next year', () => {
    const current = new Date('2026-06-01T00:00:00.000Z');
    const startDate = new Date('2025-06-01T00:00:00.000Z');

    expect(getNextOccurrence('YEARLY', current, startDate).toISOString()).toBe(
      '2027-06-01T00:00:00.000Z',
    );
  });

  it('clamps a Feb 29th anchor to Feb 28th in non-leap years and back to the 29th in leap years', () => {
    const startDate = new Date('2024-02-29T00:00:00.000Z');

    const nextYear = getNextOccurrence('YEARLY', startDate, startDate);
    expect(nextYear.toISOString()).toBe('2025-02-28T00:00:00.000Z');

    const twoYearsLater = getNextOccurrence('YEARLY', nextYear, startDate);
    expect(twoYearsLater.toISOString()).toBe('2026-02-28T00:00:00.000Z');
  });
});
