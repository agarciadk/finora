const DURATION_UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

// Supports the same short duration strings @nestjs/jwt's `expiresIn` accepts
// (e.g. "5m", "7d"), so JWT_ACCESS_EXPIRATION/JWT_REFRESH_EXPIRATION can be
// passed straight to signAsync AND converted to milliseconds for cookie
// maxAge/DB expiresAt without keeping two separately-formatted env vars.
export function parseDurationToMs(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());

  if (!match) {
    throw new Error(
      `Invalid duration "${value}" (expected e.g. "5m", "7d", "1h", "30s")`,
    );
  }

  const [, amount, unit] = match;
  return Number(amount) * DURATION_UNIT_MS[unit];
}
