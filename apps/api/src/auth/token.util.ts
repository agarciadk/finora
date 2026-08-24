import { createHmac, randomBytes } from 'node:crypto';

// Shared by refresh/verification/reset tokens: we only ever store this hash,
// never the raw token, so a DB leak doesn't let anyone impersonate a user.
export function hashToken(rawToken: string): string {
  const secret = process.env['REFRESH_TOKEN_HASH_SECRET'];

  if (!secret) {
    throw new Error('REFRESH_TOKEN_HASH_SECRET is not set');
  }

  return createHmac('sha256', secret).update(rawToken).digest('hex');
}

export function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

// Playwright can't read a real mailbox, so in test env only we hand back the
// raw token in the API response instead of just emailing it.
export function isTestEnv(): boolean {
  return process.env['NODE_ENV'] === 'test';
}
