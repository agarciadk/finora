# Finora — Personal Finance Manager
[![CI](https://github.com/agarciadk/finora/actions/workflows/ci.yml/badge.svg)](https://github.com/agarciadk/finora/actions/workflows/ci.yml)

A modern full-stack personal finance platform to manage accounts, track transactions, set budgets, and analyze financial health.

## Tech stack

**Frontend** (`apps/web`)

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) with the [shadcn](https://ui.shadcn.com/) CLI (`base-luma` style, built on [Base UI](https://base-ui.com/) primitives)
- [react-router-dom](https://reactrouter.com/) for client-side routing
- [recharts](https://recharts.org/) for the analytics charts, wrapped in a reusable shadcn-style `Chart` component
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) for internationalization

**Backend** (`apps/api`)

- [NestJS](https://nestjs.com/) + TypeScript, scaffolded with [`@nestjs/cli`](https://docs.nestjs.com/cli/overview)
- [Prisma](https://www.prisma.io/) + PostgreSQL for persistence, with a driver adapter (`@prisma/adapter-pg`)
- [`@nestjs/jwt`](https://docs.nestjs.com/security/authentication) + rotating refresh tokens for authentication, both delivered as `HttpOnly`/`Secure` cookies; passwords hashed with `bcryptjs`
- [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus) powering the `GET /health` health check endpoint
- [class-validator](https://github.com/typestack/class-validator) for request DTO validation
- [`@nestjs/swagger`](https://docs.nestjs.com/openapi/introduction) (with the CLI plugin, so DTOs don't need manual `@ApiProperty()` decorators) for OpenAPI docs, enabled in development only

**Tooling**

- [pnpm workspaces](https://pnpm.io/workspaces) to manage the `apps/web` and `apps/api` packages (plus their isolated `test`/`e2e` tooling packages) from a single monorepo
- Shared ESLint config (`eslint-config/`, published internally as `@finora/eslint-config`) and shared root-level `tsconfig.*.json` files, reused by both apps

## Features

- Responsive dashboard with a collapsible sidebar (drawer), header with the app name, a language switcher and a light/dark mode toggle.
- Pages: Resumen (dashboard), Cuentas, Categorías, Transacciones, Presupuestos, Analítica, Ajustes and a custom 404 page.
- Real authentication: register and log in against the API, short-lived JWT access tokens (5 min) plus rotating refresh tokens (7 days) in `HttpOnly`/`Secure` cookies, "remember me" (persistent vs. session-only refresh cookie), automatic silent refresh on the frontend, and a logout confirmation dialog. Refresh token reuse is detected and revokes every active session for that user.
- Multi-device session management: every login creates a `Session` record (IP address, user agent, last-active timestamp) tied to its refresh token. The Ajustes page lists every active session, flags the current one, and lets the user log out a single device or every other device at once (both with a confirmation dialog).
- Sessions end automatically after 15 minutes of inactivity, and any session end (inactivity or a failed silent refresh) redirects to the login page with a toast explaining why.
- Loading spinners (`lucide-react`) on the login and logout buttons, and other in-flight actions, for clearer feedback while a request is pending.
- Full CRUD backed by PostgreSQL/Prisma: accounts, categories, transactions and budgets (with progress vs. limit), each scoped to the authenticated user; categories can be global or created per-user.
- Interest-bearing accounts (Cuentas Remuneradas): an account can optionally track its TAE (annual percentage yield), tax rate and interest payment day. Each account has a detail page (`/cuentas/:id`) showing its transactions (search, date range, pagination, bulk actions) plus, for interest-bearing accounts, a metrics card with the 30-day average balance, the projected next net interest payment and the next payment date.
- Recurring payments & subscriptions (`/recurrentes`): define payments/income that repeat weekly, monthly or yearly, with a "Total gastos fijos mensuales" summary (active expenses normalized to a monthly amount) and per-payment cards flagging overdue/due-soon next payment dates. "Marcar como pagado" atomically creates the corresponding transaction and advances the next payment date, anchored on the original start date's day-of-month so short months (or Feb 29th) never cause permanent drift.
- Dedicated Categorías page for managing categories (name, type, edit/delete). Deleting a category is always safe: a single Prisma transaction finds or creates a fallback "Otros" category matching its type and reassigns every transaction/budget/recurring payment pointing at the deleted category before soft-deleting it, so there are never orphan records.
- Transactions support server-side date-range filtering, case-insensitive description search, filtering by one or more accounts, pagination (configurable page size, capped at 50 per request) and inline recategorization straight from the table, including quick creation of a new category without leaving the view.
- Bulk actions on transactions: select multiple rows (checkboxes plus a "select all" for the current page) to reassign their category or account, or soft-delete them, all in a single request; every bulk endpoint re-verifies that the transactions belong to the authenticated user.
- Import transactions from CSV, XLSX or legacy XLS files (e.g. Santander exports): a pluggable backend importer architecture (`papaparse`/`exceljs`/`xlsx`) parses the file, the frontend previews the parsed rows and flags likely duplicates, and the user confirms before the batch is inserted atomically in a single Prisma transaction.
- Analytics: `GET /analytics?month&year` aggregates income/expenses/savings-rate trends and spending by category for any past or current month, and `GET /analytics/evolution?months=` returns the income/expenses/savings-rate evolution for the trailing N months (default 6, max 12) in a single aggregated query. The Analítica page lets you browse any month with a previous/next month selector, and visualizes the data with `recharts`-powered area and pie charts (Resumen also shows the current month's KPIs).
- Notification preferences and profile settings, persisted per user.
- Route protection: every page except `/login` and `/registro` requires an active session.
- Internationalized UI (Spanish and English) with automatic detection of the browser's preferred language and a manual language switcher.
- Accessibility-conscious UI, verified with automated axe-core scans (semantic landmarks, headings, color contrast, accessible names for interactive components).
- Backend health check endpoint (`GET /health`) reporting memory (heap/RSS) and disk usage status.
- Interactive API documentation (Swagger UI) at `GET /api-docs`, available only when `NODE_ENV=development`; endpoints are grouped by feature via `@ApiTags`.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (this repo uses a pnpm workspace)
- [Docker](https://www.docker.com/) (to run the PostgreSQL database via `compose.yml`)

## Getting started

```bash
pnpm install

# Copy the env files and fill in the required secrets (see "Environment variables" below)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:up       # start PostgreSQL (docker compose)
pnpm db:migrate  # apply Prisma migrations

pnpm dev         # starts PostgreSQL, then the API and the web app together
# or run them separately:
pnpm dev:web     # frontend, http://localhost:5173
pnpm dev:api     # backend (NestJS), http://localhost:3000
```

## Environment variables

- Root `.env` (used by `compose.yml`): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`.
- `apps/api/.env`: `DATABASE_URL`, `JWT_ACCESS_SECRET` and `REFRESH_TOKEN_HASH_SECRET` (generate each with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`), `COOKIE_SAME_SITE` (`lax` by default), `CORS_ORIGIN`.
- `apps/web/.env`: `VITE_API_URL` (defaults to `/api`, proxied to the API in dev by `vite.config.ts` so auth cookies work same-origin).

See each `.env.example` file for details.

## Project structure

This repository is a pnpm workspace with two applications under `apps/`, each with its own `package.json`, plus shared configuration at the root:

```
.
├── compose.yml          # PostgreSQL service used in local dev and CI
├── eslint-config/       # Shared ESLint rules (@finora/eslint-config): common, api and web configs
├── tsconfig.base.json   # Shared base TypeScript compiler options
├── tsconfig.api.json    # Shared TypeScript options for apps/api
├── tsconfig.web.json    # Shared TypeScript options for apps/web
└── apps/
    ├── web/           # Frontend app (React + Vite)
    │   ├── src/       # Application source code (pages, hooks, auth context, API client)
    │   ├── test/      # Unit tests (Vitest + Testing Library) — own package.json
    │   └── e2e/       # End-to-end & accessibility tests (Playwright + axe-core) — own package.json
    └── api/           # Backend app (NestJS)
        ├── prisma/    # Prisma schema and migrations
        ├── src/       # Application source code (auth, accounts, transactions, budgets, analytics, health, ...)
        └── test/      # e2e tests (Jest) — unit tests live alongside src as *.spec.ts
```

Test dependencies are intentionally kept out of each app's main `package.json` so production/dev dependencies stay lean; each test package declares only what it needs.

## Available scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `pnpm dev` | Start PostgreSQL, then the frontend and backend dev servers together. |
| `pnpm dev:web` | Start the frontend's Vite dev server. |
| `pnpm dev:api` | Wait for PostgreSQL, then start the backend's NestJS dev server (watch mode). |
| `pnpm db:up` / `pnpm db:down` | Start/stop the local PostgreSQL container (`compose.yml`). |
| `pnpm db:generate` | Regenerate the Prisma client from `apps/api/prisma/schema.prisma`. |
| `pnpm db:migrate` | Create and apply a Prisma migration in dev (`prisma migrate dev`). |
| `pnpm db:studio` | Open Prisma Studio to browse the local database. |
| `pnpm build` | Build every app in the workspace. |
| `pnpm lint` | Run ESLint across every app in the workspace. |
| `pnpm typecheck` | Type-check the frontend. |
| `pnpm test` | Run frontend unit tests (Vitest, in `apps/web/test`). |
| `pnpm test:e2e` | Run frontend end-to-end tests (Playwright, in `apps/web/e2e`); starts the API and web app automatically (PostgreSQL must already be running). |
| `pnpm test:e2e:ui` | Run frontend end-to-end tests in Playwright's UI mode. |
| `pnpm test:a11y` | Run frontend accessibility tests (axe-core + Playwright, in `apps/web/e2e`). |
| `pnpm clean` | Remove `node_modules`, `dist` and `pnpm-lock.yaml` from every workspace package and reinstall. |

Additional per-app scripts (run with `pnpm --filter <package> <script>`, e.g. `pnpm --filter @finora/web typecheck`):

- `apps/web`: `format`, `typecheck`, `preview`.
- `apps/api`: `start`, `start:debug`, `start:prod`, `test:watch`, `test:cov`, `test:debug`, `prisma:generate`, `prisma:migrate`, `prisma:migrate:deploy`, `prisma:reset`, `prisma:studio`.

Before running `pnpm test:e2e` or `pnpm test:a11y` for the first time, install the required browser:

```bash
pnpm --filter @finora/e2e install-browsers
```

## Testing

Both the e2e and accessibility Playwright suites drive real login/registration flows, so the API and a PostgreSQL database must be running (`pnpm db:up && pnpm db:migrate`) before `pnpm test:e2e` or `pnpm test:a11y`.

- **Frontend unit tests** (`apps/web/test/`): Vitest + React Testing Library, covering hooks (`useAuth`, `useIdleTimer`), utilities, and key pages/components (login/register validation, route protection); network calls are mocked, so no backend is required. The idle-timeout logic is verified with Vitest's simulated timers (`vi.useFakeTimers()`) instead of real waits.
- **Frontend end-to-end tests** (`apps/web/e2e/tests/*.spec.ts`): Playwright drives a real browser against the app (the API and the web dev server are started automatically, see `playwright.config.ts`), covering login, registration, navigation, logout, session expiration (forced refresh-token failure), "remember me" (cookie persistence), CSV/XLSX transaction import (using fixture files under `apps/web/e2e/tests/fixtures/`) and the 404 page.
- **Frontend accessibility tests** (`apps/web/e2e/tests/*.a11y.spec.ts`): Playwright + `@axe-core/playwright` scan every page and key interactive states (dialogs, forms) for automatically detectable WCAG issues.
- **Backend tests** (`apps/api/src/**/*.spec.ts` and `apps/api/test/`): Jest unit and e2e tests, run with `pnpm --filter @finora/api test` and `pnpm --filter @finora/api test:e2e`.

## Authentication

Authentication is handled entirely by the API using short-lived JWT access tokens and rotating refresh tokens, both delivered as `HttpOnly`, `Secure` cookies (see `apps/api/src/auth/`):

- `POST /auth/register` and `POST /auth/login` issue an access token (5 minutes, signed with `JWT_ACCESS_SECRET`) and a refresh token (7 days, a random 512-bit value hashed with `REFRESH_TOKEN_HASH_SECRET` before being stored).
- `POST /auth/refresh` rotates the refresh token on every use; reusing an already-rotated (or expired) token is treated as a possible theft and revokes every active session for that user.
- `POST /auth/logout` revokes the current refresh token and clears both cookies.
- "Remember me" controls whether the refresh token cookie is persistent or session-only; everything else (accounts, transactions, budgets, ...) is scoped to the authenticated user via a request-scoped `CurrentUserService`.
- In development, Vite proxies `/api` to the API (`apps/web/vite.config.ts`) so requests stay same-origin and cookies work with `SameSite=Lax`. Set `COOKIE_SAME_SITE=none` if the frontend and API are deployed on different origins without a shared-domain proxy.

## Internationalization

The UI copy lives in `apps/web/src/i18n/locales/<lang>/translation.json` (currently `es` and `en`), loaded and configured in `apps/web/src/i18n/config.ts`.

- On first load, the language is resolved in this order: a previously saved preference (`localStorage`, key `finora_language`), then the browser's preferred language (`navigator.languages`), falling back to Spanish (`es`) if neither is supported.
- Users can switch languages at any time with the language switcher in the dashboard header (next to the mode toggle); the choice is persisted in `localStorage` for the next visit.
- To add a new language, create a new folder under `apps/web/src/i18n/locales/<lang>/translation.json` mirroring the existing keys and register it in the `resources` object in `apps/web/src/i18n/config.ts`.
- Only UI copy (headings, labels, buttons, messages, table headers, accessible names) is translated; user data (accounts, transactions, budgets, category names) is stored and displayed as entered.

## CI/CD

Workflows live in `.github/workflows/`:

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | push/PR to `main` | Lint, typecheck, unit tests and build for every app (matrix). |
| `e2e.yml` | PR to `main` | Starts PostgreSQL, applies migrations, builds the API, then runs the Playwright e2e suite. |
| `accessibility.yml` | PR to `main` | Same setup as `e2e.yml`, running the axe-core accessibility suite instead. |
| `migrations-check.yml` | PR to `main` | Install, lint, build, start PostgreSQL, apply migrations and run the API test suite against a clean database. |
| `deploy.yml` | push to `main` | Builds the API, deploys it to Render (via a deploy hook), then runs `prisma migrate deploy` against the production (Neon) database. |
| `release.yml` | PR merged to `main` | Bumps the version, tags the release and creates a release branch. |

`migrations-check.yml` and `deploy.yml` only cover the database/API side; the production `JWT_ACCESS_SECRET`, `REFRESH_TOKEN_HASH_SECRET` and `COOKIE_SAME_SITE` must be configured directly on the hosting platform (e.g. Render), not in these workflows.

## Deployment

The backend deploys to [Render](https://render.com/) (via `deploy.yml`, see above), the database is hosted on [Neon](https://neon.tech/), and the frontend deploys to [Vercel](https://vercel.com/) using Vercel's native Git integration (no GitHub workflow needed for it).

### Database (Neon)

1. Create a Neon project and database. Neon gives you two connection strings: a **pooled** one (goes through PgBouncer, host has a `-pooler` suffix) and a **direct/unpooled** one.
2. Use the **pooled** connection string as the API's `DATABASE_URL` (Render env var) — it's the one the running app should use for normal queries.
3. Use the **direct/unpooled** connection string as `DATABASE_URL_PRODUCTION` (GitHub `production` environment secret) — `prisma migrate deploy` needs a direct connection (advisory locks/prepared statements don't work reliably through the pooler).
4. Both connection strings already include `?sslmode=require`, which Neon requires; `pg`/`@prisma/adapter-pg` honor it automatically, no extra config needed.

### Backend (Render)

1. Create a Render **Web Service** from this repo, either by importing [render.yaml](./render.yaml) as a Blueprint or by configuring it manually with: build command `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @finora/api build`, start command `node apps/api/dist/src/main.js`, health check path `/health`.
2. On the service, set these environment variables: `DATABASE_URL` (Neon's **pooled** connection string), `JWT_ACCESS_SECRET`, `REFRESH_TOKEN_HASH_SECRET`, `CORS_ORIGIN` (your Vercel production URL), `COOKIE_SAME_SITE` (`lax` if you use the Vercel rewrite proxy below; `none` if the frontend calls the Render domain directly).
3. Turn off Render's auto-deploy on push (`autoDeploy: false` in [render.yaml](./render.yaml)) so deploys are driven by `deploy.yml` instead — this keeps the deploy and the migration in the same, ordered workflow run. Under the service's Settings → Deploy Hook, copy the deploy hook URL.
4. On GitHub, set the `production` environment's secrets used by `deploy.yml`: `RENDER_DEPLOY_HOOK_URL` (the deploy hook URL from step 3) and `DATABASE_URL_PRODUCTION` (Neon's **direct/unpooled** connection string, see above).

### Frontend (Vercel)

1. Import this repository into Vercel and set the project's **Root Directory** to `apps/web` (Vercel still resolves the pnpm workspace correctly from there).
2. `apps/web/vercel.json` rewrites `/api/*` to the Render API, so requests stay same-origin from the browser's point of view and auth cookies keep working with `SameSite=Lax`. Replace the placeholder destination in that file with your actual Render API domain (or a custom domain) before deploying.
3. Set `VITE_API_URL=/api` as a Vercel environment variable (matches the rewrite above; this is also the local dev default).

If you'd rather have the frontend call the Render API directly (skipping the Vercel rewrite), set `VITE_API_URL` to the full Render API URL instead and switch the API's `COOKIE_SAME_SITE` to `none` — the auth cookies won't be sent cross-site otherwise.

## Git hooks

This repository uses [Husky](https://typicode.github.io/husky/). The `pre-commit` hook runs, in order: `pnpm lint`, `pnpm test`, `pnpm test:e2e` and `pnpm test:a11y`. A commit is blocked if any of these fail. Since `test:e2e`/`test:a11y` exercise real login/registration, make sure PostgreSQL is running and migrated locally (`pnpm db:up && pnpm db:migrate`) before committing.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes to this project.

## License

This project is licensed under the Apache-2.0 License. See the LICENSE file for details.
