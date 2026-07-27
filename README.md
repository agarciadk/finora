# Finora — Personal Finance Manager

A modern full-stack personal finance platform to manage accounts, track transactions, set budgets, and analyze financial health.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) with the [shadcn](https://ui.shadcn.com/) CLI (`base-luma` style, built on [Base UI](https://base-ui.com/) primitives)
- [react-router-dom](https://reactrouter.com/) for client-side routing
- [pnpm workspaces](https://pnpm.io/workspaces) to keep test tooling isolated from the app's own dependencies

## Features

- Responsive dashboard with a collapsible sidebar (drawer), header with the app name and a light/dark mode toggle.
- Pages: Resumen (dashboard), Cuentas, Transacciones, Presupuestos, Analítica, Ajustes and a custom 404 page.
- Simulated authentication: login with email/password validation, "remember me" (persisted in `localStorage`, otherwise `sessionStorage`), a "welcome back" quick sign-in card for remembered users, and a logout confirmation dialog.
- Route protection: every page except `/login` requires an active session.
- Accessibility-conscious UI, verified with automated axe-core scans (semantic landmarks, headings, color contrast, accessible names for interactive components).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (this repo uses a pnpm workspace)

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173` by default.

## Project structure

This repository is a pnpm workspace made up of three packages:

```
.
├── src/         # Application source code (the "personal-finance-manager" package)
├── test/        # Unit tests (Vitest + Testing Library) — own package.json
└── test_e2e/    # End-to-end & accessibility tests (Playwright + axe-core) — own package.json
```

Test dependencies are intentionally kept out of the root `package.json` so the app's production/dev dependencies stay lean; each test package declares only what it needs.

## Available scripts

Run from the repository root:

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server. |
| `pnpm build` | Type-check and build the app for production. |
| `pnpm preview` | Preview the production build locally. |
| `pnpm lint` | Run ESLint across the project. |
| `pnpm format` | Format `.ts`/`.tsx` files with Prettier. |
| `pnpm typecheck` | Run TypeScript in `--noEmit` mode. |
| `pnpm test` | Run unit tests (Vitest, in `test/`). |
| `pnpm test:e2e` | Run end-to-end tests (Playwright, in `test_e2e/`). |
| `pnpm test:a11y` | Run accessibility tests (axe-core + Playwright, in `test_e2e/`). |
| `pnpm clean` | Remove `node_modules`, `dist` and `pnpm-lock.yaml` from every workspace package and reinstall. |
| `pnpm clear` | Remove `node_modules`, `dist` and `pnpm-lock.yaml` from the root package only, and reinstall. |

Before running `pnpm test:e2e` or `pnpm test:a11y` for the first time, install the required browser:

```bash
pnpm --filter ./test_e2e install-browsers
```

## Testing

- **Unit tests** (`test/`): Vitest + React Testing Library, covering hooks (`useAuth`), utilities, and key pages/components (login validation, route protection).
- **End-to-end tests** (`test_e2e/tests/*.spec.ts`): Playwright drives a real browser against the app (started automatically via `pnpm dev`), covering login, navigation, logout, "remember me" and the 404 page.
- **Accessibility tests** (`test_e2e/tests/*.a11y.spec.ts`): Playwright + `@axe-core/playwright` scan every page and key interactive states (dialogs, cards) for automatically detectable WCAG issues.

## Git hooks

This repository uses [Husky](https://typicode.github.io/husky/). The `pre-commit` hook runs, in order: `pnpm lint`, `pnpm test`, `pnpm test:e2e` and `pnpm test:a11y`. A commit is blocked if any of these fail.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes to this project.

## License

This project is licensed under the Apache-2.0 License. See the LICENSE file for details.
