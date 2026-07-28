# Finora — Personal Finance Manager
[![CI](https://github.com/agarciadk/finora/actions/workflows/ci.yml/badge.svg)](https://github.com/agarciadk/finora/actions/workflows/ci.yml)
[![Vercel](https://vercelbadge.vercel.app/api/agarciadk/finora)]([https://vercel.com/agarciadk/finora)

A modern full-stack personal finance platform to manage accounts, track transactions, set budgets, and analyze financial health.

## Tech stack

**Frontend** (`apps/web`)

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) with the [shadcn](https://ui.shadcn.com/) CLI (`base-luma` style, built on [Base UI](https://base-ui.com/) primitives)
- [react-router-dom](https://reactrouter.com/) for client-side routing
- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) for internationalization

**Backend** (`apps/api`)

- [NestJS](https://nestjs.com/) + TypeScript, scaffolded with [`@nestjs/cli`](https://docs.nestjs.com/cli/overview)
- [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus) powering the `GET /health` health check endpoint

**Tooling**

- [pnpm workspaces](https://pnpm.io/workspaces) to manage the `apps/web` and `apps/api` packages (plus their isolated `test`/`e2e` tooling packages) from a single monorepo
- Shared ESLint config (`eslint-config/`, published internally as `@finora/eslint-config`) and shared root-level `tsconfig.*.json` files, reused by both apps

## Features

- Responsive dashboard with a collapsible sidebar (drawer), header with the app name, a language switcher and a light/dark mode toggle.
- Pages: Resumen (dashboard), Cuentas, Transacciones, Presupuestos, Analítica, Ajustes and a custom 404 page.
- Simulated authentication: login with email/password validation, "remember me" (persisted in `localStorage`, otherwise `sessionStorage`), a "welcome back" quick sign-in card for remembered users, and a logout confirmation dialog.
- Route protection: every page except `/login` requires an active session.
- Internationalized UI (Spanish and English) with automatic detection of the browser's preferred language and a manual language switcher.
- Accessibility-conscious UI, verified with automated axe-core scans (semantic landmarks, headings, color contrast, accessible names for interactive components).
- Backend health check endpoint (`GET /health`) reporting memory (heap/RSS) and disk usage status.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (this repo uses a pnpm workspace)

## Getting started

```bash
pnpm install
pnpm dev:web  # frontend, http://localhost:5173
pnpm dev:api  # backend (NestJS)
```

## Project structure

This repository is a pnpm workspace with two applications under `apps/`, each with its own `package.json`, plus shared configuration at the root:

```
.
├── eslint-config/       # Shared ESLint rules (@finora/eslint-config): common, api and web configs
├── tsconfig.base.json   # Shared base TypeScript compiler options
├── tsconfig.api.json    # Shared TypeScript options for apps/api
├── tsconfig.web.json    # Shared TypeScript options for apps/web
└── apps/
    ├── web/           # Frontend app (React + Vite)
    │   ├── src/       # Application source code
    │   ├── test/      # Unit tests (Vitest + Testing Library) — own package.json
    │   └── e2e/       # End-to-end & accessibility tests (Playwright + axe-core) — own package.json
    └── api/           # Backend app (NestJS)
        ├── src/       # Application source code (includes the `/health` module)
        └── test/      # e2e tests (Jest) — unit tests live alongside src as *.spec.ts
```

Test dependencies are intentionally kept out of each app's main `package.json` so production/dev dependencies stay lean; each test package declares only what it needs.

## Available scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `pnpm dev:web` | Start the frontend's Vite dev server. |
| `pnpm dev:api` | Start the backend's NestJS dev server (watch mode). |
| `pnpm build` | Build every app in the workspace. |
| `pnpm lint` | Run ESLint across every app in the workspace. |
| `pnpm test` | Run frontend unit tests (Vitest, in `apps/web/test`). |
| `pnpm test:e2e` | Run frontend end-to-end tests (Playwright, in `apps/web/e2e`). |
| `pnpm test:e2e:ui` | Run frontend end-to-end tests in Playwright's UI mode. |
| `pnpm test:a11y` | Run frontend accessibility tests (axe-core + Playwright, in `apps/web/e2e`). |
| `pnpm clean` | Remove `node_modules`, `dist` and `pnpm-lock.yaml` from every workspace package and reinstall. |

Additional per-app scripts (run with `pnpm --filter <package> <script>`, e.g. `pnpm --filter @finora/web typecheck`):

- `apps/web`: `format`, `typecheck`, `preview`.
- `apps/api`: `start`, `start:debug`, `start:prod`, `test:watch`, `test:cov`, `test:debug`.

Before running `pnpm test:e2e` or `pnpm test:a11y` for the first time, install the required browser:

```bash
pnpm --filter @finora/e2e install-browsers
```

## Testing

- **Frontend unit tests** (`apps/web/test/`): Vitest + React Testing Library, covering hooks (`useAuth`), utilities, and key pages/components (login validation, route protection).
- **Frontend end-to-end tests** (`apps/web/e2e/tests/*.spec.ts`): Playwright drives a real browser against the app (started automatically via `pnpm dev:web`), covering login, navigation, logout, "remember me" and the 404 page.
- **Frontend accessibility tests** (`apps/web/e2e/tests/*.a11y.spec.ts`): Playwright + `@axe-core/playwright` scan every page and key interactive states (dialogs, cards) for automatically detectable WCAG issues.
- **Backend tests** (`apps/api/src/**/*.spec.ts` and `apps/api/test/`): Jest unit and e2e tests, run with `pnpm --filter @finora/api test` and `pnpm --filter @finora/api test:e2e`.

## Internationalization

The UI copy lives in `apps/web/src/i18n/locales/<lang>/translation.json` (currently `es` and `en`), loaded and configured in `apps/web/src/i18n/config.ts`.

- On first load, the language is resolved in this order: a previously saved preference (`localStorage`, key `finora_language`), then the browser's preferred language (`navigator.languages`), falling back to Spanish (`es`) if neither is supported.
- Users can switch languages at any time with the language switcher in the dashboard header (next to the mode toggle); the choice is persisted in `localStorage` for the next visit.
- To add a new language, create a new folder under `apps/web/src/i18n/locales/<lang>/translation.json` mirroring the existing keys and register it in the `resources` object in `apps/web/src/i18n/config.ts`.
- Only actual UI copy (headings, labels, buttons, messages, table headers, accessible names) is translated; the mock/demo data shown in the app (sample accounts, transactions, budgets) is intentionally left as-is.

## Git hooks

This repository uses [Husky](https://typicode.github.io/husky/). The `pre-commit` hook runs, in order: `pnpm lint`, `pnpm test`, `pnpm test:e2e` and `pnpm test:a11y`. A commit is blocked if any of these fail.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes to this project.

## License

This project is licensed under the Apache-2.0 License. See the LICENSE file for details.
