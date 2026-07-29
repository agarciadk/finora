# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
