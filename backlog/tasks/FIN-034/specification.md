# Specification

## Context

No `.github/workflows/codeql.yml` exists today (confirmed: `.github/workflows/` only has `accessibility.yml`, `ci.yml`, `deploy.yml`, `e2e.yml`, `migrations-check.yml`, `release.yml`). GitHub also offers a zero-config "default setup" toggle (repo Settings → Code security) as an alternative to an in-repo workflow file — either satisfies the inbox request; an in-repo workflow is more explicit/versioned.

## Functional Requirements

- Add a standard CodeQL workflow analyzing `javascript-typescript` (covers both `apps/api` NestJS and `apps/web` React/Vite code).
- Trigger on push/PR to `main` plus a weekly schedule (GitHub's own template default).

## Out of Scope

- Enabling CodeQL for any language beyond JavaScript/TypeScript (the whole repo is TS).
