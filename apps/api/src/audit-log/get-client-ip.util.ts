import type { Request } from 'express';

// `request.ip` only reflects the real client IP if Express is told to trust
// the reverse proxy in front of it (see `app.set('trust proxy', ...)` in
// main.ts) — required in production (Render sits behind a proxy).
export function getClientIp(request: Request): string | undefined {
  if (request.ip) {
    return request.ip;
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim();
  }

  return request.socket.remoteAddress ?? undefined;
}
