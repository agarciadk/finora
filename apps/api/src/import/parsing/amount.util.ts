// Parses money values coming from bank exports into a signed decimal string
// with exactly 2 decimals (e.g. "-1234.56"), without relying on floating
// point arithmetic for the string-based path (CSV/plain text cells). Excel
// numeric cells are already IEEE-754 floats by the time they reach us, so
// those are rounded defensively instead of reparsed as strings.
const CURRENCY_SYMBOLS_REGEX = /[€$£\s]/g;
const AMOUNT_REGEX = /^-?\d+\.\d{2}$/;

function stripSign(value: string): { negative: boolean; digits: string } {
  let negative = false;
  let digits = value.trim();

  if (digits.startsWith('(') && digits.endsWith(')')) {
    negative = true;
    digits = digits.slice(1, -1);
  }

  if (digits.startsWith('-')) {
    negative = true;
    digits = digits.slice(1);
  } else if (digits.startsWith('+')) {
    digits = digits.slice(1);
  } else if (digits.endsWith('-')) {
    negative = true;
    digits = digits.slice(0, -1);
  }

  return { negative, digits: digits.trim() };
}

function normalizeSeparators(digits: string): string | null {
  const dotIndex = digits.lastIndexOf('.');
  const commaIndex = digits.lastIndexOf(',');

  let integerPart: string;
  let decimalPart: string;

  if (dotIndex === -1 && commaIndex === -1) {
    integerPart = digits;
    decimalPart = '';
  } else if (dotIndex > commaIndex) {
    // '.' is the decimal separator, ',' (if any) is a thousands separator.
    integerPart = digits.slice(0, dotIndex).replaceAll(',', '');
    decimalPart = digits.slice(dotIndex + 1);
  } else if (commaIndex > dotIndex) {
    // ',' is the decimal separator, '.' (if any) is a thousands separator.
    integerPart = digits.slice(0, commaIndex).replaceAll('.', '');
    decimalPart = digits.slice(commaIndex + 1);
  } else {
    return null;
  }

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(decimalPart)) {
    return null;
  }
  if (decimalPart.length > 2) {
    // Unexpected sub-cent precision: round instead of truncating silently.
    const rounded = Math.round(Number(`0.${decimalPart}`) * 100);
    decimalPart = String(rounded).padStart(2, '0');
  } else {
    decimalPart = decimalPart.padEnd(2, '0');
  }

  return `${integerPart}.${decimalPart}`;
}

export function parseAmount(raw: string | number | null | undefined): {
  value: string | null;
  error?: string;
} {
  if (raw === null || raw === undefined) {
    return { value: null, error: 'Importe vacío' };
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      return { value: null, error: 'Importe no válido' };
    }
    const rounded = Math.round(raw * 100) / 100;
    return { value: rounded.toFixed(2) };
  }

  const trimmed = raw.replace(CURRENCY_SYMBOLS_REGEX, '');
  if (trimmed.trim() === '') {
    return { value: null, error: 'Importe vacío' };
  }

  const { negative, digits } = stripSign(trimmed);
  if (digits === '') {
    return { value: null, error: 'Importe no válido' };
  }

  const normalized = normalizeSeparators(digits);
  if (normalized === null || !AMOUNT_REGEX.test(normalized)) {
    return { value: null, error: 'Importe no válido' };
  }

  const isZero = /^0\.00$/.test(normalized);
  const value = negative && !isZero ? `-${normalized}` : normalized;

  return { value };
}

// Combines separate "cargo"/"abono" (charge/credit) columns into a single
// signed amount: charge is negative, credit is positive.
export function combineChargeAndCredit(
  charge: string | number | null | undefined,
  credit: string | number | null | undefined,
): { value: string | null; error?: string } {
  const parsedCharge =
    charge === null || charge === undefined || charge === ''
      ? null
      : parseAmount(charge);
  const parsedCredit =
    credit === null || credit === undefined || credit === ''
      ? null
      : parseAmount(credit);

  if (parsedCharge?.error) {
    return { value: null, error: parsedCharge.error };
  }
  if (parsedCredit?.error) {
    return { value: null, error: parsedCredit.error };
  }

  const hasCharge = parsedCharge?.value && Number(parsedCharge.value) !== 0;
  const hasCredit = parsedCredit?.value && Number(parsedCredit.value) !== 0;

  if (hasCharge && hasCredit) {
    return { value: null, error: 'Cargo y abono simultáneos' };
  }

  if (hasCharge) {
    const abs = parsedCharge.value!.replace('-', '');
    return { value: `-${abs}` };
  }

  if (hasCredit) {
    const abs = parsedCredit.value!.replace('-', '');
    return { value: abs };
  }

  return { value: null, error: 'Importe vacío' };
}
