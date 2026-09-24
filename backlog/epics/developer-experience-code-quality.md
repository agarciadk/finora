---
id: developer-experience-code-quality
title: Developer Experience / Code Quality
status: active
created_at: 2026-09-22
updated_at: 2026-09-22
---

# developer-experience-code-quality — Developer Experience / Code Quality

## Summary

Groups engineering-quality/tooling additions to the CI pipeline and backend observability: HTTP request logging, SonarQube/SonarCloud, Semgrep (via Husky), and CodeQL. All four are infra/tooling work not tied to a single product change (`type: technical`/`chore`), and together form a coherent "raise the quality bar" initiative referenced directly in the inbox.

## Tasks

- [x] FIN-031 — HTTP request logging in the backend
- [x] FIN-032 — Integrate SonarQube/SonarCloud in CI
- [ ] FIN-033 — Integrate Semgrep into the Husky pre-commit hook
- [ ] FIN-034 — Enable CodeQL on GitHub

## Notes

- These four are independent of each other and can be implemented in any order.
- FIN-032 and FIN-033/FIN-034 need an externally-created account/token (SonarCloud) or repository-level toggle (CodeQL, Semgrep App) that only a human with admin access to the GitHub repo can provision — flagged in each task's `implementation.md`.
- "Añadir analíticas para analizar qué hace el usuario en la página" (FIN-035, product/user-behavior analytics) is deliberately **not** part of this epic — it's a different concern (product analytics with privacy/consent implications) from backend/CI observability.
