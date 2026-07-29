import type { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const ACCESS_TOKEN_TTL_SECONDS = 5 * 60;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sameSite(): CookieOptions['sameSite'] {
  const value = process.env['COOKIE_SAME_SITE'];
  return value === 'strict' || value === 'none' ? value : 'lax';
}

// `Secure` is always on: modern browsers treat http://localhost as a secure
// context, so this works in local dev too and matches production behind TLS.
export function accessTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: sameSite(),
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  };
}

// Scoped to /auth so the refresh token is never sent to unrelated API routes.
export function refreshTokenCookieOptions(persistent: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: sameSite(),
    path: '/auth',
    ...(persistent ? { maxAge: REFRESH_TOKEN_TTL_MS } : {}),
  };
}
