---
description: "Use when writing or running tests/validation for apps/web or apps/api (Vitest, Testing Library, Playwright, axe-core, Jest)."
applyTo: "apps/web/test/**,apps/web/e2e/**,apps/api/test/**,apps/api/src/**/*.spec.ts"
---

# Testing & validation conventions

- **Frontend unit tests** (`apps/web/test/`): Vitest + React Testing Library; network calls are mocked, no backend required. Use `vi.useFakeTimers()` for timeout/idle logic instead of real waits.
- **Frontend e2e tests** (`apps/web/e2e/tests/*.spec.ts`): Playwright against a real browser; the API/web dev servers start automatically (`playwright.config.ts`), but PostgreSQL must already be running (`pnpm db:up && pnpm db:migrate`).
- **Frontend accessibility tests** (`apps/web/e2e/tests/*.a11y.spec.ts`): Playwright + `@axe-core/playwright`.
- **Backend tests**: Jest, unit specs alongside `src/**/*.spec.ts`, e2e specs in `apps/api/test/` (`pnpm --filter @finora/api test` / `test:e2e`).
- Before running Playwright locally, kill any process on `:3000`/`:5173` — a reused dev server may be missing `NODE_ENV=test`, breaking test backdoors (see `.ai-context/04-gotchas.md`).
- The Husky pre-commit hook already runs `pnpm lint`, `pnpm test`, `pnpm test:e2e` and `pnpm test:a11y` — never bypass it with `--no-verify`; fix reported failures instead.

See the "Testing" section of `.ai-context/04-gotchas.md` for known DTO/reflect-metadata, upload/accept, and async-provider gotchas.
