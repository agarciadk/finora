import { RecurringFrequency } from '../generated/prisma/enums';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

function lastDayOfUtcMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// Advances `current` by one month, but the target day-of-month is always
// derived from `startDate` (the *anchor*) rather than from `current` itself.
// This prevents drift on short months: e.g. an anchor day of 31 clamps to 28
// in February, but the following advance still targets 31 (clamped to 30) in
// April, instead of permanently shrinking to 28 for every month after.
function advanceMonthly(current: Date, anchorDay: number): Date {
  const year = current.getUTCFullYear();
  const nextMonthIndex = current.getUTCMonth() + 1;
  const day = Math.min(anchorDay, lastDayOfUtcMonth(year, nextMonthIndex));

  // `Date.UTC` normalizes month overflow (e.g. index 12 in December) into
  // the following year automatically, so no manual year rollover is needed.
  return new Date(
    Date.UTC(
      year,
      nextMonthIndex,
      day,
      current.getUTCHours(),
      current.getUTCMinutes(),
      current.getUTCSeconds(),
      current.getUTCMilliseconds(),
    ),
  );
}

// Same anchor idea as `advanceMonthly`, applied to the year: an anchor of
// February 29th clamps to the 28th in non-leap years without ever "forgetting"
// that the real target is the 29th once a leap year comes around again.
function advanceYearly(
  current: Date,
  anchorMonth: number,
  anchorDay: number,
): Date {
  const year = current.getUTCFullYear() + 1;
  const day = Math.min(anchorDay, lastDayOfUtcMonth(year, anchorMonth));

  return new Date(
    Date.UTC(
      year,
      anchorMonth,
      day,
      current.getUTCHours(),
      current.getUTCMinutes(),
      current.getUTCSeconds(),
      current.getUTCMilliseconds(),
    ),
  );
}

// Computes the next occurrence after `current`, given the recurring
// payment's `frequency` and its immutable `startDate` (used purely as the
// source of the anchor day/month, never mutated itself).
export function getNextOccurrence(
  frequency: RecurringFrequency,
  current: Date,
  startDate: Date,
): Date {
  switch (frequency) {
    case 'WEEKLY':
      return new Date(current.getTime() + DAYS_PER_WEEK * MS_PER_DAY);
    case 'MONTHLY':
      return advanceMonthly(current, startDate.getUTCDate());
    case 'YEARLY':
      return advanceYearly(
        current,
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
      );
  }
}
