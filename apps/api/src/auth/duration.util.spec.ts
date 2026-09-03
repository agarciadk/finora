import { parseDurationToMs } from './duration.util';

describe('parseDurationToMs', () => {
  it.each([
    ['30s', 30 * 1000],
    ['5m', 5 * 60 * 1000],
    ['1h', 60 * 60 * 1000],
    ['7d', 7 * 24 * 60 * 60 * 1000],
  ])('parses "%s" to %d ms', (value, expected) => {
    expect(parseDurationToMs(value)).toBe(expected);
  });

  it('throws on an invalid format', () => {
    expect(() => parseDurationToMs('5 minutes')).toThrow(
      'Invalid duration "5 minutes"',
    );
  });

  it('throws on an unsupported unit', () => {
    expect(() => parseDurationToMs('5w')).toThrow('Invalid duration "5w"');
  });
});
