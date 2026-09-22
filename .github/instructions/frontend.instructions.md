---
description: "Use when working on apps/web (React, Vite, Tailwind, shadcn/Base UI, routing, i18n, frontend tests)."
applyTo: "apps/web/**"
---

# Frontend conventions (apps/web)

Before making changes here, read `.ai-context/00-coding-skills.md` (React/Tailwind/Shadcn UI sections) and `.ai-context/03-ui-ux.md` (base components, forms/sheets, bundle/routing, i18n) — this file only surfaces them automatically for this folder, it does not replace them. Also check `.ai-context/04-gotchas.md` (React/StrictMode/effects, React Router v7, Base UI) before touching effects, refs or navigation.

## Validation

Run the relevant commands for what you touched before considering a frontend change done (see root [README.md](../../README.md) for the full list):

- `pnpm --filter @finora/web typecheck` and `pnpm lint`
- `pnpm test` (Vitest unit tests, `apps/web/test/`)
- `pnpm test:e2e` / `pnpm test:a11y` (Playwright — run when you add or modify a route, page component, or multi-step interaction such as a form or navigation flow; skip for isolated component styling or copy changes. Both require PostgreSQL running via `pnpm db:up`; if `pnpm db:up` fails or PostgreSQL is unavailable, report this blocker before skipping e2e/a11y tests.)
