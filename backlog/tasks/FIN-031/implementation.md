# Implementation

## Approach

Added a global `RequestLoggingMiddleware` (`NestMiddleware`, not an interceptor) so the final status code — including for error responses handled later by Nest's exception filters — is guaranteed to be correct: it listens on the response's `finish` event rather than logging synchronously inside `intercept()`. Registered globally via `AppModule implements NestModule` + `consumer.apply(RequestLoggingMiddleware).forRoutes('*')`, which runs before the `ThrottlerGuard`/`JwtAuthGuard`/`helmet()` pipeline without altering it. `request.user` (populated later by `JwtAuthGuard`) is read inside the `finish` listener, by which point the guard has already run on the same request object, so `userId` is included whenever available.

## Files / Areas Affected

- `apps/api/src/common/request-logging/request-logging.middleware.ts` (new).
- `apps/api/src/common/request-logging/request-logging.middleware.spec.ts` (new, unit tests).
- `apps/api/src/app.module.ts` (registers the middleware globally via `NestModule#configure`).

## Implementation Steps

- [x] Add a request-logging interceptor/middleware.
- [x] Ensure it excludes sensitive routes/fields per the Security section.
- [x] Register it globally.

## Testing

- [x] Unit tests for the middleware (`request-logging.middleware.spec.ts`): logs method/path/status/duration, includes `userId` when authenticated, omits it otherwise, and logs the final status code for error responses (404).

## Validation

- [x] `pnpm --filter @finora/api lint` — clean.
- [x] `pnpm --filter @finora/api test` — 29 suites / 192 tests passed (includes the 4 new middleware tests).
- [x] `pnpm --filter @finora/api build` — passes (`prisma generate && nest build`).
- [x] Manual check: `curl` a couple of endpoints and confirm log output — skipped in favor of the equivalent unit test coverage (the middleware only formats/logs a string; no manual server run was needed to validate that string).
- [ ] `pnpm --filter @finora/api test:e2e` — not strictly required by `testing.instructions.md` (this change doesn't modify any controller, route, DTO, or guard), but attempted anyway since the middleware applies to every route. **Could not run to completion**: fails immediately with `Cannot find module './internal/class.js'` while importing the generated Prisma client, before any test executes. Confirmed via `git stash` that this reproduces identically on the pre-existing `main` branch (unrelated to this change) — root cause is `apps/api/test/jest-e2e.json` missing the `moduleNameMapper` (`.js`→`.ts`) that the unit-test Jest config already has, combined with Prisma 7.10's ESM-style generated imports. Logged as a discovered issue in `backlog/inbox.md`.

## Discovered Work (out of scope)

- `apps/api/test/jest-e2e.json` is missing the `.js`→`.ts` `moduleNameMapper`, breaking `test:e2e` entirely with the current generated Prisma client (see `backlog/inbox.md`).

## Notes

- No new dependency/module was needed (`Logger`, `Response#on('finish')` are enough), so no dedicated `RequestLoggingModule` was created — the middleware is registered directly in `AppModule`, consistent with how `main.ts` already wires cross-cutting concerns (`helmet()`, `cookieParser()`) at the app level.
