import { parseAmount, combineChargeAndCredit } from './amount.util';

describe('parseAmount', () => {
  it('parses plain decimal point amounts', () => {
    expect(parseAmount('1234.56')).toEqual({ value: '1234.56' });
  });

  it('parses plain decimal comma amounts', () => {
    expect(parseAmount('1234,56')).toEqual({ value: '1234.56' });
  });

  it('parses amounts with thousands dot and decimal comma, with currency symbol', () => {
    expect(parseAmount('1.234,56 €')).toEqual({ value: '1234.56' });
  });

  it('parses negative amounts with currency symbol', () => {
    expect(parseAmount('-25,50 €')).toEqual({ value: '-25.50' });
  });

  it('parses amounts with thousands comma and decimal point', () => {
    expect(parseAmount('1,234.56')).toEqual({ value: '1234.56' });
  });

  it('parses accounting-style negative amounts in parentheses', () => {
    expect(parseAmount('(25.50)')).toEqual({ value: '-25.50' });
  });

  it('pads single decimal digit values', () => {
    expect(parseAmount('10,5')).toEqual({ value: '10.50' });
  });

  it('rejects empty values', () => {
    expect(parseAmount('')).toEqual({ value: null, error: 'Importe vacío' });
    expect(parseAmount(null)).toEqual({ value: null, error: 'Importe vacío' });
  });

  it('rejects non-numeric values', () => {
    expect(parseAmount('abc')).toEqual({
      value: null,
      error: 'Importe no válido',
    });
  });

  it('rounds numeric (Excel) cell values defensively', () => {
    expect(parseAmount(1234.567)).toEqual({ value: '1234.57' });
  });
});

describe('combineChargeAndCredit', () => {
  it('turns a charge into a negative amount', () => {
    expect(combineChargeAndCredit('50,00', null)).toEqual({ value: '-50.00' });
  });

  it('turns a credit into a positive amount', () => {
    expect(combineChargeAndCredit(null, '100,00')).toEqual({
      value: '100.00',
    });
  });

  it('rejects rows with both a charge and a credit', () => {
    expect(combineChargeAndCredit('10,00', '20,00')).toEqual({
      value: null,
      error: 'Cargo y abono simultáneos',
    });
  });

  it('rejects rows with neither a charge nor a credit', () => {
    expect(combineChargeAndCredit(null, null)).toEqual({
      value: null,
      error: 'Importe vacío',
    });
  });
});
