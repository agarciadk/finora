# 01 — Architecture & Infrastructure

## Monorepo
- pnpm workspaces: `apps/api` (NestJS, ESLint 9.x) + `apps/web` (React/Vite, ESLint 10.x). ESLint/typescript-eslint versions **differ** between apps — never assume the same version when touching config.
- `eslint-config/` (workspace package `@finora/eslint-config`, `workspace:*`): exposes `./common`, `./api`, `./web`. Factories receive ESLint plugins as parameters (DI) instead of importing them directly.
  - ⚠️ NEVER declare `@eslint/js`, `eslint`, `typescript-eslint`, etc. as dependencies/peerDependencies of the shared package: pnpm resolves `"*"` peerDependencies to a SINGLE version (the newest in the workspace), breaking the app pinned to the older version.
- Shared tsconfigs live at the ROOT: `tsconfig.base.json`, `tsconfig.api.json`, `tsconfig.web.json`. Each app's tsconfig `extends` the base and keeps only path-sensitive options (outDir, baseUrl, paths, include) locally — relative paths in an "extended" tsconfig resolve relative to the BASE file, not the extending one.
- Root `node_modules` only links deps from the root `package.json`; any shared package needs its own `package.json` as a workspace package for bare-specifier imports to resolve.
- `apps/api/package.json` `start:prod` script uses `node dist/main`, but the actual build outputs to `dist/src/main.js` (no `rootDir` set). Not critical (`start:dev`/`start` use `nest start`), but `render.yaml`/`deploy.yml` already use the correct path (`dist/src/main.js`) — never "fix" this without syncing both places.

## Backend stack (`apps/api`)
- NestJS + Prisma (`prisma-client` generator, requires `moduleFormat = "cjs"` in `schema.prisma` — otherwise it emits `import.meta.url` in the output and breaks Nest's CJS build).
- `main.ts` requires `import 'dotenv/config'` at the top (dotenv in `dependencies`, not dev) — Nest does not load `.env` on its own.
- `PrismaService` (`apps/api/src/prisma/prisma.service.ts`): does NOT extend `PrismaClient` directly. It builds an extended client (soft delete, see [02-auth-security.md](./02-auth-security.md)) and uses a `Proxy` to forward non-own props — this keeps the ~8 existing services unchanged in how they consume it.

## Frontend stack (`apps/web`)
- React + Vite. UI components built on `@base-ui/react` (see [03-ui-ux.md](./03-ui-ux.md)).
- `lib/api.ts`: fetch wrapper, `VITE_API_URL` (default `/api` via Vite proxy → same-origin in dev).

## Data model (Prisma, `apps/api/prisma/schema.prisma`)
- `User` (+ `passwordHash`, `emailVerified`, hashed `verificationToken`/`resetPasswordToken`, `resetPasswordExpires`).
- `Account` (type enum CHECKING/SAVINGS/CREDIT_CARD/CASH, `balance Decimal(12,2)` **manual, not an accumulated ledger**; `interestRate`/`taxRate Decimal(5,2)?`, `interestPaymentDay Int?`).
- `Category` (type enum INCOME/EXPENSE, unique `userId+name`).
- `Transaction` (amount Decimal, type enum, refs Account/Category, `categoryId` NOT nullable).
- `Budget` (limit Decimal + month/year, unique `userId+categoryId+month+year`; "spent" is computed at runtime, never persisted).
- `NotificationPreference` (enum BUDGET_ALERTS/WEEKLY_SUMMARY/PRODUCT_NEWS, unique `userId+type`).
- `RefreshToken` (rotation, HMAC hash, `rememberMe`, `revokedAt`).
- `AuditLog` (`userId`, action enum CREATE/UPDATE/DELETE/LOGIN, `entityName`, `entityId?`, `ipAddress?`, `details? Json`, index `[userId, createdAt]`).
- `RecurringPayment` (name/amount/type/frequency WEEKLY|MONTHLY|YEARLY/account/category/startDate/nextPaymentDate/isActive).
- Soft delete (`deletedAt DateTime?`) on `Account`/`Transaction`/`Category`/`Budget`/`RecurringPayment` — see extension in [02-auth-security.md](./02-auth-security.md).
- ⚠️ `src/generated/prisma` may contain versioned empty `internal/`/`models/` folders that break `prisma generate` ("exists and is not empty but doesn't look like a generated Prisma Client") — `rm -rf` that folder before regenerating.

## CI/CD (`.github/workflows/`)
- `ci.yml`: lint/typecheck/test/build matrix on push+PR to `main`.
- `e2e.yml`: PR, Playwright (spins up Postgres, migrates, exports `JWT_ACCESS_SECRET`/`REFRESH_TOKEN_HASH_SECRET`/`DATABASE_URL`).
- `release.yml`: PR closed+merged to `main`, automatic version bump in `package.json` (commit `chore: release x.y.z`, touches only that file).
- `migrations-check.yml`: PR to `main` — install/lint/build api, `docker compose -f compose.yml up -d postgres`, `prisma migrate deploy`, tests.
- `deploy.yml`: push to `main` — build api, deploy to Render via deploy hook (`curl` + `RENDER_DEPLOY_HOOK_URL` secret), then `prisma migrate deploy` against the `DATABASE_URL_PRODUCTION` secret (`production` environment).
- Common convention: `pnpm/action-setup@v4` version 10, `actions/setup-node@v4` node 22 with pnpm cache, `pnpm install --frozen-lockfile`.
- Versioning: **edit CHANGELOG.md by hand on the feature branch** with the target version number BEFORE merging — `release.yml` always performs the `package.json` bump.

## Deployment
- Backend: **Render** (`render.yaml` at root, `autoDeploy: false` on purpose — `deploy.yml` triggers the deploy so the migration runs in the same ordered run; `startCommand: node apps/api/dist/src/main.js`).
- Production DB: **Neon** (local still uses Postgres in Docker). Two connection strings: pooled (`-pooler`, for runtime `DATABASE_URL`) vs direct/unpooled (for `DATABASE_URL_PRODUCTION`/`prisma migrate deploy` — the pooler doesn't handle Prisma Migrate's advisory locks/prepared statements well). Both use `?sslmode=require`.
- Frontend: **Vercel** (`apps/web/vercel.json`, rewrites `/api/*` → Render domain).
- New env vars required in Render/prod (not in `deploy.yml`, configure manually): `JWT_ACCESS_SECRET`, `REFRESH_TOKEN_HASH_SECRET`, `COOKIE_SAME_SITE`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`, `FRONTEND_URL`, `CORS_ORIGIN`.
