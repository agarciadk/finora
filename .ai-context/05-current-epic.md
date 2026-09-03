# 05 — Active Epic

> Update this file when starting a new epic. When closing it, move reusable rules/gotchas to 01-04 and reset this section to "No active epic".

## Current state

No active epic. Epic 7 (UI/UX Redesign & Logic Consolidation) is fully closed — see "Recent history" below for the summary of all its sub-epics (7.1, 7.2, 7.3.1, 7.3.2).

## Recent history (closed epics, most recent first)

- **Smart Logic — Frontend** (Epic 7.3.2, branch `feature/smart-assistant-ui` from `main`): wired the Smart Assistant fields added in 7.3.1 into the UI. Settings > Profile tab gained a real form (`mainIncomeSource` text input + `payday` number input 1-31) connected to `PATCH /users/me`. Accounts form (Wealth tab) gained an `iban` input, displayed masked (`ES91 •••• •••• •••• 1332`, see `formatIban` in [01-architecture.md](./01-architecture.md)/`lib/utils.ts`) on the account card. Transactions form gained an `isTransfer` checkbox; the DataTable shows a "Transferencia" badge + grays out the row/amount for transfer rows. Dashboard gained a prominent "Margen Vital" KPI card (`GET /analytics/vital-margin`) above the existing summary grid, colored green/red depending on sign. `useAnalytics()` now also exposes `vitalMargin` (same independent-fetch pattern as `evolution`). Verified: `tsc`/`eslint` clean, `vitest run` 53/53.
- **Smart Logic — Backend & DB** (Epic 7.3.1, same branch): Prisma additions `User.mainIncomeSource`/`payday`, `Account.iban` (`@IsIBAN()`), `Transaction.isTransfer` (`@default(false)`). `AnalyticsService` excludes `isTransfer: true` transactions from every income/expense/category query; new `GET /analytics/vital-margin` (active `RecurringPayment` rows, INCOME minus EXPENSE, normalized to monthly).
- **Tabs Migration** (Epic 7.2, branch `feature/ui-ux-redesign` from `main`): consolidated 8 pages into 5 core routes (`/`, `/patrimonio`, `/planificacion`, `/analitica`, `/ajustes`) using shadcn Tabs; old standalone pages deleted, bodies moved into `components/<feature>/*-tab.tsx` files (see [01-architecture.md](./01-architecture.md)). Verified: `tsc`/`eslint` clean, `vitest run` 53/53.
- **Skeleton & Routes** (Epic 7.1, `apps/web`): refactored React Router to the 5 core routes (`/`, `/patrimonio`, `/planificacion`, `/analitica`, `/ajustes`) with placeholder `wealth-page.tsx`/`planning-page.tsx` views and a matching 5-item `AppSidebar`, reusing the existing `React.lazy()`/`ROUTE_PRELOADERS` code-splitting pattern (see [03-ui-ux.md](./03-ui-ux.md)). Verified: `tsc`/`eslint` clean.
- **Bundle optimization + Initial blank-screen fix** (branch `feature/initial-blank-screen`, from 0.13.0, commit `dab6bc9`): spinner during the initial auth check + navigation fix for Suspense/React Router v7 (see [03-ui-ux.md](./03-ui-ux.md) and [04-gotchas.md](./04-gotchas.md)). Verified: 53/53 tests, build with no chunk warnings >500kB, clean lint, full pre-commit hook passed.
- **Advanced Idle UX & Countdown Modal** (branch `feature/advanced-idle-ux`, from 0.11.0 → 0.12.0): two-phase countdown modal, env-configurable timeouts, heartbeat saga (added and removed — see gotchas), fix for the inverted silent auto-dismiss.
- **Time Machine Analytics & Charts** (branch `feature/temporal-analytics`, from 0.10.0 → 0.11.0): `GET /analytics/evolution`, recharts v3, `AnalyticsMonthSelector`.
- **Recurring Payments & Subscriptions** (branch `feature/recurring-payments`, from 0.9.0): `RecurringPayment` model, drift-free date logic.
- **Interest-Bearing Accounts & Detail View** (branch `feature/interest-bearing-accounts`, from 0.8.0/`main`): `GET /accounts/:id` with stats, detail page.
- **Category Management** (branch `feature/category-management`): safe delete with reassignment to "Others", `PrismaService#runInTransaction`.
- **Super Transactions** (branch `feature/super-transactions`, from `feature/swagger-docs`): search/filter by account, bulk actions, `.xls` support.
- **Swagger/OpenAPI** (branch `feature/swagger-docs`, from `feature/advanced-sessions`): documentation at `/api-docs` (dev only).

## Known technical debt (non-critical, do not touch unless asked)
- `apps/api/package.json` `start:prod` script uses `node dist/main` but the actual build outputs `dist/src/main.js` (workaround already applied in `render.yaml`/`deploy.yml`; the script itself is still unfixed).
- `apps/api/test/jest-e2e.json` lacks the `.js` `moduleNameMapper` that the `package.json` config has — fails as soon as an e2e spec touches Prisma.
- `apps/web/test/components/import-transactions-dialog.test.tsx` had a pre-existing, unrelated broken test (check whether it's still the case before touching that file).
