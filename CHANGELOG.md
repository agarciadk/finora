# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-09-03

### Added

- **Advanced idle UX & countdown modal (Epic 6)**: the idle-logout flow is now two-phase. `useIdleTimer` takes a `warningTimeout` and a `logoutTimeout` and exposes a `resetIdleTimer()` function instead of a single fire-and-forget callback. `useIdleLogout` (14 min warning / 15 min logout by default) surfaces `isIdleWarning` and a live `remainingSeconds` countdown, computed each tick from a fixed deadline (`Date.now()` diff) rather than decremented by 1, so it can't drift even under a delayed interval.
- New `IdleWarningModal` (shadcn `AlertDialog`), mounted once in `DashboardLayout` so it covers every private route: shows "¿Sigues ahí?" with a live "closes in N seconds" countdown, "Sigo aquí" (resets the idle clock) and "Cerrar sesión" (ends the session immediately). If the countdown reaches 0 the session is closed automatically. New `session.idleWarning.*` translations (es/en).
- **Dynamic frontend-backend session sync**: `POST /auth/login` and `POST /auth/refresh` now return `expiresAt` (ISO8601), derived from the freshly-signed access token's own `exp` claim (`AuthService#signAccessToken`), never a separately hardcoded TTL. `GET /users/me` returns the same `expiresAt`, computed from the current request's JWT via a new `CurrentUserService#getAccessTokenExpiresAt()`, so a page reload (no fresh login) can still learn it. New `AuthSessionResponseDto`/`CurrentUserResponseDto` document the shape in Swagger (`@ApiOkResponse`/`@ApiProperty`), and every `AuthController` handler now has an `@ApiOperation`.
- New `use-session-heartbeat.ts`: proactively calls `/auth/refresh` ~60s before the backend-reported `expiresAt` elapses, but only while the user has been active in the last 5 minutes (DOM events or an API call), leaving a genuinely idle tab to expire naturally instead of being kept alive forever. Reuses `lib/api.ts`'s existing single-flight refresh guard, so a heartbeat-triggered refresh can never race the reactive 401-retry one (refresh tokens rotate on every use, so two concurrent refresh calls would otherwise look like a stolen/reused token and revoke every session for the user). Mounted in `DashboardLayout` alongside `useIdleLogout`.
- `lib/session-events.ts` gained a second event, `onSessionRefreshed`, so `AuthProvider` can keep `user.expiresAt` current after ANY successful silent refresh (reactive or heartbeat-driven) without `lib/api.ts` touching React state directly.
- New e2e suite `apps/web/e2e/tests/session-sync.spec.ts`: verifies `expiresAt` reflects the real ~5 minute access token lifespan, that `/auth/refresh` rotates the access token, the (rotating) refresh token, and its "remember me" expiry strictly forward; and that the frontend proactively rotates the refresh token cookie on its own (via the heartbeat) well before the token would otherwise expire, without ending the session.

### Fixed

- **Active users could get logged out as "idle"**: `useIdleTimer`'s default event list now includes `click` and `scroll` (previously only `mousemove`/`mousedown`/`keydown`/`touchstart`/`wheel`), and `lib/api.ts` now dispatches a `finora:user-activity` window event on every API request, which `useIdleTimer` listens to alongside DOM events. This means any real interaction — including background fetches while the user is otherwise reading the screen — resets both the warning and logout timers, and silently dismisses an already-open warning modal instead of requiring an explicit click.
- **Critical: the refresh token cookie was never actually sent to `/auth/refresh`.** `refreshTokenCookieOptions()` scoped the cookie to `Path=/auth`, but the browser only ever calls this backend through the frontend's same-origin `/api` proxy/rewrite (Vite dev proxy locally, Vercel rewrite in prod), so every request is actually `/api/auth/refresh` from the browser's point of view - which doesn't match a `Path=/auth` cookie. Every real refresh (proactive or reactive) was silently 401ing, forcing a full logout instead of sliding the session. Found by the new `session-sync.spec.ts` e2e test, which is the first one to exercise a real (non-mocked) `/auth/refresh` round-trip. Fixed by scoping the cookie to `Path=/api/auth` instead.


## [0.11.0] - 2026-08-30

### Added

- **Time Machine Analytics & Charts (Epic 5)**: new `GET /analytics/evolution?months=` endpoint (default 6, max 12) returning `[{ month: 'YYYY-MM', income, expenses, savingsRate }]` for the trailing N months, oldest to newest. It runs a single `transaction.findMany` query for the whole window and aggregates the buckets in memory instead of one aggregate query pair per month, avoiding an N+1 loop.
- `GET /analytics` query params (`month`/`year`) are now validated through `GetAnalyticsQueryDto` (1-12 / 2000-2100 ranges) instead of a bare `ParseIntPipe`, and both endpoints are fully documented with `@ApiOperation`/`@ApiQuery`.
- Charts on the Analítica page, built with `recharts` and a reusable shadcn-style `ChartContainer`/`ChartTooltipContent`/`ChartLegendContent` wrapper (`components/ui/chart.tsx`): an area chart comparing income vs. expenses over the last 6 months, and a pie chart (plus a detailed list) for the spending-by-category breakdown of the selected month.
- **Month selector** (previous/next buttons, localized month/year label, and a "current month" shortcut) at the top of the Analítica page lets the user browse the single-month KPIs (income, expenses, savings rate) and category breakdown for any past month; the evolution chart always shows the trailing 6 months regardless of the selected month.
- `use-analytics.ts` rewritten to own the selected month/year internally (`goToPreviousMonth`/`goToNextMonth`/`goToCurrentMonth`) and to fetch the evolution data independently from the single-month analytics, so paging through months doesn't refetch the (unrelated) trend chart.

### Changed

- `DashboardPage` now calls `useAnalytics()` with no arguments (it only ever needed the current month, which is the hook's default).

## [0.10.0] - 2026-08-30

### Added

- **Recurring payments & subscriptions**: new `RecurringPayment` model (name, amount, type, `frequency` — WEEKLY/MONTHLY/YEARLY —, account, category, `startDate`/`nextPaymentDate`, `isActive`), soft-deletable like the other core models. Full CRUD via `RecurringPaymentsController`/`Service`, plus `POST /recurring-payments/:id/execute` ("Marcar como pagado"), which atomically creates the corresponding `Transaction` and advances `nextPaymentDate` inside a single Prisma transaction.
- Next-occurrence date math anchors every monthly/yearly advance on `startDate`'s day-of-month (and month, for yearly payments) rather than the previous occurrence, so a day-31 or Feb-29th anchor is clamped down on short months without permanently drifting to a smaller day afterwards.
- New "Recurrentes" page (`/recurrentes`, linked from the sidebar): a "Gastos fijos mensuales" summary card (active EXPENSE payments normalized to a monthly amount) plus a card grid of recurring payments (category/account badges, frequency, next payment date highlighted red when overdue or amber when due soon), with create/edit via a Sheet form and delete/mark-as-paid confirmations via `AlertDialog`.
- `CategoriesService#remove()` now also reassigns `RecurringPayment.categoryId` to the fallback "Otros" category, matching the existing transaction/budget reassignment.
- Swagger documentation (`@ApiTags`/`@ApiOperation`/`@ApiProperty`) for the new controller and DTOs.

## [0.9.0] - 2026-08-30

### Added

- **Interest-bearing accounts (Cuentas Remuneradas)**: `Account` gains optional `interestRate` (TAE), `taxRate` and `interestPaymentDay` fields. The create/edit account form gained a "Cuenta remunerada" switch that reveals these three inputs; unchecking it clears them.
- **Account detail page** (`/cuentas/:id`, reached by clicking an account card): shows the account header (name, type, bank, balance) and, for interest-bearing accounts, a metrics card with the TAE, tax rate, 30-day average daily balance and the projected next net interest payment with its date. Below it, a transactions table locked to that account (search, date range filter, pagination, inline recategorization and bulk category/delete actions).
- `GET /accounts/:id` now returns the account plus a `stats` object (`averageBalanceLast30Days`, `projectedNextInterestPayment`, `nextInterestPaymentDate`). The 30-day average balance is reconstructed in TypeScript from the account's current `balance` and its transactions in that window (there's no stored running ledger), walking backward one day at a time and undoing each transaction's effect as the day boundary is crossed — O(transactions + 30) instead of re-scanning per day.
- `TransactionsBulkActionsBar` gained an optional `hideAccountAction` prop, used by the account detail page to hide the "change account" bulk action (meaningless when the table is already locked to one account).

### Changed

- The account create/edit Sheet's field list is now scrollable (`overflow-y-auto`) so its footer/save button stays reachable now that the form can grow taller than the viewport.

## [0.8.0] - 2026-08-28

### Added

- **Category management page**: a new "Categorías" page (`/categorias`, linked from the sidebar) lists every category in a table with a type badge (Ingreso/Gasto), and lets the user create, edit and delete categories through the same Sheet/AlertDialog patterns used elsewhere in the app.
- **Safe category deletion**: `DELETE /categories/:id` now runs inside a single Prisma transaction that finds or creates a fallback category named "Otros" matching the deleted category's type, reassigns every transaction and budget currently pointing at the deleted category to it (row-by-row for budgets, to avoid violating the `(userId, categoryId, month, year)` unique constraint when "Otros" already has a budget for the same period), and only then soft-deletes the requested category. The delete confirmation dialog explicitly warns the user about this reassignment.
- `@ApiOperation` documentation on every `CategoriesController` endpoint and `@ApiProperty` on `CreateCategoryDto`, describing the reassignment behavior of the delete endpoint.

### Changed

- `PrismaService` gained a `runInTransaction()` helper (and an exported `PrismaTransactionClient` type) as the one safe way to run Prisma interactive transactions against the soft-delete-extended client — calling the proxy-forwarded `$transaction` directly would rebind `this` to the internal `Proxy` and break Prisma's runtime.

## [0.7.0] - 2026-08-28

### Added

- **Advanced transaction search & filtering**: `GET /transactions` now supports a case-insensitive `search` on the description and filtering by one or more `accountIds`, alongside the existing date range and pagination. The Transacciones page gained a debounced search box (magnifying glass icon) and a multi-select account filter (only shown when the user has more than one account).
- **Bulk actions on transactions**: `PATCH /transactions/bulk/category`, `PATCH /transactions/bulk/account` and `DELETE /transactions/bulk` let the frontend reassign the category/account of many transactions at once or soft-delete them, all after re-verifying every id belongs to the authenticated user. The table gained a checkbox column (with "select all" for the current page); selecting one or more rows reveals a bulk actions bar (change category/account via dialogs, delete via a destructive confirmation dialog) with loading spinners and automatic selection clearing on success.
- **Legacy `.xls` import support**: a new `XlsTransactionImporter` (built on SheetJS `xlsx`, installed from the official `cdn.sheetjs.com` distribution to avoid the abandoned/vulnerable npm release) parses old-format Excel exports such as Santander's, reusing the same column-detection and amount/date parsing already shared by the CSV/XLSX importers. The upload dialog and Multer file filter now accept `.xls`/`application/vnd.ms-excel` in addition to `.csv`/`.xlsx`.
- Swagger documentation for every new/changed endpoint: `@ApiOperation`/`@ApiQuery` on `GET /transactions` and the new bulk endpoints, `@ApiProperty` on the new bulk DTOs, and `@ApiOperation`/`@ApiConsumes`/`@ApiBody` on the import preview endpoint.

## [0.6.0] - 2026-08-28

### Added

- Swagger (OpenAPI) documentation for the API: `@nestjs/swagger` with the CLI plugin enabled (`nest-cli.json`) so DTOs don't need manual `@ApiProperty()` decorators, `DocumentBuilder` setup describing the cookie-based auth flow (plus an optional Bearer scheme for manual testing), and `@ApiTags` grouping every controller by feature. The UI (`GET /api-docs`) is only registered when `NODE_ENV=development`, never in production.

## [0.5.0] - 2026-08-24

### Added

- Multi-device session management: a new `Session` model (IP address, user agent, last-active timestamp) tied to each refresh token, created at login and updated on every refresh-token rotation. The access token now carries the session id so the API can tell which session made the request.
- `GET /sessions`, `DELETE /sessions/:id` and `DELETE /sessions` (revoke all but the current one) endpoints, scoped to the authenticated user.
- Ajustes page: new "Sesiones activas" card listing every session (device/browser/OS parsed from the user agent with `ua-parser-js`, IP, last-active date), a badge for the current session, and per-session/"log out everywhere else" revoke actions with confirmation dialogs.

### Changed

- Logging out now deletes the corresponding `Session` (cascading to its refresh tokens) instead of only revoking the refresh token row; detected refresh-token reuse and a password reset now delete every `Session` for that user instead of just marking refresh tokens as revoked.

## [0.4.0] - 2026-08-24

### Added

- CSV/XLSX transaction import: a pluggable `TransactionImporter` architecture in `apps/api` (`papaparse` for CSV, `exceljs` for XLSX), plus a frontend upload → preview → duplicate-detection → confirm flow that inserts the batch atomically in a single Prisma transaction.
- Server-side date-range filtering and pagination for `GET /transactions` (configurable page size, capped at 50), plus inline recategorization of a transaction directly from the table, including quick creation of a new category without leaving the view.
- Support for per-user custom categories alongside the existing global ones.
- Automatic logout after 15 minutes of user inactivity (`useIdleTimer`/`useIdleLogout` hooks), and a toast notification (via `sonner`) explaining why the session ended (inactivity or a failed silent refresh) after redirecting to the login page.
- Loading spinners (`lucide-react`'s `Loader2`) on the login and logout buttons while their requests are in flight.

### Changed

- `GET /transactions` now returns `{ data, meta: { total, page, limit, totalPages } }` instead of a plain array, to support pagination.
- `AuthProvider` now lives inside the router so it can react to session-ending events (inactivity, failed refresh) and redirect to `/login` with the reason.

## [0.3.0] - 2026-07-29

### Feature

- Add a Prisma/PostgreSQL data model (accounts, categories, transactions, budgets, notification preferences) with full CRUD endpoints in `apps/api`, and wire the Cuentas, Transacciones, Presupuestos and Ajustes pages to create, edit and delete real records.
- Add a `GET /analytics` endpoint aggregating income, expenses, savings rate and spending by category, powering the Resumen and Analítica pages with real data instead of static mocks.
- Add user registration (`POST /auth/register` and a `/registro` page).
- Replace simulated, `localStorage`-based authentication with real JWT authentication: short-lived access tokens and rotating refresh tokens delivered as `HttpOnly`/`Secure` cookies, refresh token reuse detection that revokes every active session, "remember me" backed by a persistent vs. session-only refresh cookie, and every resource scoped to the authenticated user.
- Add `migrations-check.yml` and `deploy.yml` GitHub workflows to validate database migrations on pull requests and deploy the backend on merge to `main`; update `e2e.yml` and `accessibility.yml` to provision PostgreSQL and the API so the Playwright suites exercise real login and registration flows.

## [0.2.0] - 2026-07-28

### Feature

- Restructure the repository into a pnpm monorepo with `apps/web` (the existing frontend, moved from the repo root) and a new `apps/api` NestJS backend, each with its own `package.json`, ESLint and TypeScript configuration.
- Add a `GET /health` health check endpoint to `apps/api` using `@nestjs/terminus`, reporting memory heap/RSS and disk usage.
- Extract shared ESLint rules into a new `eslint-config` workspace package (`@finora/eslint-config`) with common, `api`-specific and `web`-specific configs.
- Extract shared TypeScript compiler options into root-level `tsconfig.base.json`, `tsconfig.api.json` and `tsconfig.web.json`, consumed by each app's own `tsconfig.json`.

## [0.1.0] - 2026-07-27

### Feature

- Add dashboard with collapsible sidebar, header, mode toggle, Resumen/Cuentas/Transacciones/Presupuestos/Analítica/Ajustes pages, simulated auth (login, logout, remember me) with route protection, a 404 page, and unit, e2e, and accessibility test suites with a Husky pre-commit hook running them all.
