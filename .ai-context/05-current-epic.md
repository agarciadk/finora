# 05 — Active Epic

> Update this file when starting a new epic. When closing it, move reusable rules/gotchas to 01-04 and reset this section to "No active epic".

## Current state
**No active epic.** Last working branch (`feature/initial-blank-screen`) already merged and deleted locally (`git branch -D feature/initial-blank-screen`).

## Recent history (closed epics, most recent first)

- **Bundle optimization + Initial blank-screen fix** (branch `feature/initial-blank-screen`, from 0.13.0, commit `dab6bc9`): spinner during the initial auth check + navigation fix for Suspense/React Router v7 (see [03-ui-ux.md](./03-ui-ux.md) and [04-gotchas.md](./04-gotchas.md)). Verified: 53/53 tests, build with no chunk warnings >500kB, clean lint, full pre-commit hook passed.
- **Advanced Idle UX & Countdown Modal** (branch `feature/advanced-idle-ux`, from 0.11.0 → 0.12.0): two-phase countdown modal, env-configurable timeouts, heartbeat saga (added and removed — see gotchas), fix for the inverted silent auto-dismiss.
- **Time Machine Analytics & Charts** (branch `feature/temporal-analytics`, from 0.10.0 → 0.11.0): `GET /analytics/evolution`, recharts v3, `AnalyticsMonthSelector`.
- **Recurring Payments & Subscriptions** (branch `feature/recurring-payments`, from 0.9.0): `RecurringPayment` model, drift-free date logic.
- **Interest-Bearing Accounts & Detail View** (branch `feature/interest-bearing-accounts`, from 0.8.0/`main`): `GET /accounts/:id` with stats, detail page.
- **Category Management** (branch `feature/category-management`): safe delete with reassignment to "Others", `PrismaService#runInTransaction`.
- **Super Transactions** (branch `feature/super-transactions`, from `feature/swagger-docs`): search/filter by account, bulk actions, `.xls` support.
- **Swagger/OpenAPI** (branch `feature/swagger-docs`, from `feature/advanced-sessions`): documentation at `/api-docs` (dev only).

## Branches pending merge to `main` (user's responsibility, not Copilot's)
- `feature/add-analytics` and its successors (Phases 1-3 security, analytics, import, filters/pagination, Render/Neon migration, session UX) — **Copilot must NOT merge/push to `main`**, the user handles it.
- There's a stray untracked `image.png` at the root of that branch, pending review/deletion.

## Known technical debt (non-critical, do not touch unless asked)
- `apps/api/package.json` `start:prod` script uses `node dist/main` but the actual build outputs `dist/src/main.js` (workaround already applied in `render.yaml`/`deploy.yml`; the script itself is still unfixed).
- `apps/api/test/jest-e2e.json` lacks the `.js` `moduleNameMapper` that the `package.json` config has — fails as soon as an e2e spec touches Prisma.
- `apps/web/test/components/import-transactions-dialog.test.tsx` had a pre-existing, unrelated broken test (check whether it's still the case before touching that file).
