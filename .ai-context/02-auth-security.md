# 02 — Auth, Security & Session

## Authentication (JWT + rotating refresh, cookies)
- JWT access token (`@nestjs/jwt`, expiration configurable via `JWT_ACCESS_EXPIRATION`, default 5min) in `access_token` cookie (path `/`).
- Opaque 512-bit refresh token (`crypto.randomBytes(64)`) in `refresh_token` cookie (path `/auth`), stored in the `RefreshToken` table as HMAC-SHA256 (`REFRESH_TOKEN_HASH_SECRET`) — **never in plaintext**.
- Rotation: every `/auth/refresh` revokes the used token and creates a new one. Reuse of a revoked/expired token = detected theft → revokes ALL sessions for that user.
- Cookies: `httpOnly: true`, `secure: true` (localhost counts as a secure context), `sameSite` via `COOKIE_SAME_SITE` (default `lax`).
- "Remember me" = persistent refresh cookie (`maxAge`) vs session cookie; `rememberMe` is stored on `RefreshToken` and propagated on every rotation.
- Configurable timeouts: backend `JWT_ACCESS_EXPIRATION`/`JWT_REFRESH_EXPIRATION` (duration strings "5m"/"7d", `apps/api/src/auth/duration.util.ts` + `AuthConfigService`). `expiresAt` is ALWAYS derived from the real JWT `exp` on the backend, never hardcoded on the frontend.
- Endpoints: `POST /auth/register`, `/login`, `/refresh`, `/logout`.
  - `register` no longer authenticates or sets cookies (to avoid skipping email verification) — returns `{message, verificationToken?}` (token only when `NODE_ENV==='test'`, Playwright backdoor).
  - `login` throws `403 ForbiddenException('EMAIL_NOT_VERIFIED')` if `!user.emailVerified` (short, stable message — frontend matches on `error.message`, not free text/locale).

## Guards & scoping
- `JwtAuthGuard` registered as the global `APP_GUARD` **inside `AuthModule`** (not `AppModule`, so it can inject `JwtService` from the same module).
- Public routes: `@Public()` decorator (`auth/public.decorator.ts`). Everything else requires a valid `access_token` cookie.
- `CurrentUserService` (`apps/api/src/common/current-user/`) is **request-scoped** (`Scope.REQUEST`, injects `REQUEST`), reads `request.user` populated by the guard — propagates REQUEST scope to anything importing `CurrentUserModule`.
- `main.ts`: `app.use(cookieParser())` + `enableCors({origin, credentials:true})` + `app.set('trust proxy', 1)` (requires `NestFactory.create<NestExpressApplication>(...)` for `app.set` to exist).

## Email verification + password recovery
- `User` +4 fields: `emailVerified`, `verificationToken`/`resetPasswordToken` (unique hash, never plaintext), `resetPasswordExpires`.
- `token.util.ts`: `hashToken()` (HMAC-SHA256, reuses `REFRESH_TOKEN_HASH_SECRET`), `generateRawToken()` (32 bytes, distinct from the 64-byte refresh token).
- `MailService`: if `SMTP_HOST` is unset, sends NOTHING — only logs the link (`Logger.log`). Links use `FRONTEND_URL` (separate from `CORS_ORIGIN`).
- `POST /auth/forgot-password` ALWAYS returns the same generic message regardless of whether the email exists (anti-enumeration); only adds `resetToken` in the test env.
- `reset-password` validates expiration (15min) and revokes ALL active `RefreshToken`s on reset (same handling as detected refresh theft).
- Specific throttling: `verify-email` 5/min (same as auth), `forgot-password`/`reset-password` 3/min (stricter).

## HTTP hardening
- `helmet()` with a strict CSP (`default-src 'self'`, `connect-src` includes `CORS_ORIGIN`, no `unsafe-inline` in scripts except Swagger in dev — see below). The backend CSP does NOT protect the SPA's HTML (served by Vite/Vercel).
- Global `ThrottlerModule` (`@nestjs/throttler`) (`APP_GUARD`=`ThrottlerGuard`, 100 req/min/IP). Login/register: `@Throttle({default:{limit:5,ttl:60_000}})`. Disabled via `skipIf: () => process.env.NODE_ENV === 'test'`.
- Sanitization: `@SanitizeHtml()` (`@Transform` + `sanitize-html`, full strip) ONLY on free-text fields visible in the UI (name, bank, description). NEVER sanitize the entire/blind body (breaks password/email/tokens/amounts).

## Soft delete + audit log
- Prisma Client Extension (`apps/api/src/prisma/extensions/soft-delete.extension.ts`), built with `Prisma.defineExtension`: injects `deletedAt: null` into `where` for reads (findMany/findFirst(OrThrow)/findUnique(OrThrow)/count/aggregate/groupBy); rewrites `delete`→`update({deletedAt:new Date()})` and `deleteMany`→`updateMany`.
- Soft-deletable models: `Account`, `Transaction`, `Category`, `Budget`, `RecurringPayment`.
- `PrismaService#runInTransaction(fn)`: the only correct way to use `$transaction` (see [04-gotchas.md](./04-gotchas.md) — calling `this.prisma.$transaction` directly breaks due to the Proxy).
- `AuditLogModule`: `AuditLogInterceptor` (`APP_INTERCEPTOR` inside the module itself) acts on handlers annotated with `@AuditLog('ACCOUNT'|'TRANSACTION'|'CATEGORY'|'BUDGET')`. Derives the action from the HTTP method (POST→CREATE, PATCH/PUT→UPDATE, DELETE→DELETE), `entityId` from params or the response body, `userId` from `request.user`. Login is audited explicitly from `AuthController` (public endpoint, no `request.user` yet). Bulk ops store `details:{transactionIds}` instead of a single `entityId`.
- IP: `getClientIp()` uses `request.ip` (requires `trust proxy`) with a fallback to `x-forwarded-for`/`socket.remoteAddress`.

## Frontend session — idle, countdown, refresh
- `useIdleTimer`: two phases (`warningTimeout`+`onIdleWarning`, `logoutTimeout`+`onIdle`), exposes `resetIdleTimer()` and `onActivity` (each activity throttled). Self-contained hook: local `useRef`s for the `setTimeout`s, DOM listeners + custom event mounted once, ~300ms debounce before resetting. **No polling, no shared state/singleton** (see the heartbeat saga in gotchas).
- Real activity = DOM events (`click`/`scroll`/mousemove/mousedown/keydown/touchstart/wheel) **+** the custom `USER_ACTIVITY_EVENT` (fired by `lib/api.ts` on every `request()` call — so background calls also count as activity).
- The warning modal's countdown is recalculated from a fixed `deadline` (`Date.now()+delta` saved in a ref when opened), never decremented by 1 (avoids drift if `setInterval` lags).
- `isWarningActiveRef`: once the warning is open, ONLY an explicit click on "I'm still here" (`resetIdleTimer()`) closes it — passive activity (moving the mouse) no longer dismisses it (inverted behavior vs. earlier versions; do not reintroduce the silent auto-dismiss).
- Session refresh: the reactive retry on 401 (`lib/api.ts#request()` retries once by calling `/auth/refresh`, except on `/auth/*` routes) is the ONLY mechanism — **do not add proactive refresh/heartbeat** (see gotchas — already tried and dropped as over-engineering).
- `lib/session-events.ts` (`EventTarget` pub/sub): the only bridge between `lib/api.ts` (outside the React tree) and `AuthProvider`. `emitSessionEnded(reason: "idle"|"expired")`.
- `AuthProvider#endSession(reason)`: `POST /auth/logout` + clears state + stores `sessionEndReason`, consumed once by `LoginPage` via `toast()` (sonner).
- Configurable frontend timeouts: `VITE_IDLE_WARNING_MINUTES`/`VITE_IDLE_LOGOUT_MINUTES` (`lib/idle-config.ts`), defaults 14/15.
- ⚠️ Restore `.env`/`.env.example` to defaults (`5m`/`7d` backend, `14`/`15` frontend) before running e2e tests that assume those values — they get edited by hand for manual testing with short timeouts.
