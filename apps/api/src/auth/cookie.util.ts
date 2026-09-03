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

// Scoped to /api/auth (not just /auth) so the refresh token is never sent to
// unrelated API routes. The prefix matters: the browser only ever calls this
// backend through the frontend's same-origin `/api` proxy/rewrite (Vite dev
// proxy locally, Vercel rewrite in prod - see apps/web/vite.config.ts and
// apps/web/vercel.json), so from its point of view every request is under
// `/api/...`, even though the backend's own route is `/auth/refresh`. A Path
// of plain `/auth` never matches an actual `/api/auth/refresh` request, so
// the cookie silently never gets sent and every refresh 401s.
export function refreshTokenCookieOptions(persistent: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: sameSite(),
    path: '/api/auth',
    ...(persistent ? { maxAge: REFRESH_TOKEN_TTL_MS } : {}),
  };
}
