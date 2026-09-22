---
description: "Use when working on apps/api (NestJS, Prisma, PostgreSQL, authentication, API conventions, backend tests)."
applyTo: "apps/api/**"
---

# Backend conventions (apps/api)

Before making changes here, read `.ai-context/01-architecture.md` (backend stack, Prisma, CI/CD) and `.ai-context/02-auth-security.md` (auth/JWT/cookies, guards, throttling, soft delete, audit log) — this file only surfaces them automatically for this folder, it does not replace them. Also check `.ai-context/04-gotchas.md` (Prisma/`PrismaService` proxy, DTO whitelisting, route declaration order) before touching services, DTOs or the Prisma schema.

## Validation

Run the relevant commands for what you touched before considering a backend change done (see root [README.md](../../README.md) for the full list):

- `pnpm --filter @finora/api lint` and `pnpm build`
- `pnpm --filter @finora/api test` (Jest unit specs, alongside `src/**/*.spec.ts`)
- `pnpm --filter @finora/api test:e2e` when the change affects request/response behavior end-to-end
