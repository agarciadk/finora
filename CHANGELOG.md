# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
