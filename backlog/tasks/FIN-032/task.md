---
id: FIN-032
type: technical
status: ready
priority: medium
epic: developer-experience-code-quality
labels: [ci]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-032 — Integrate SonarQube/SonarCloud in CI

## Summary

Add static analysis/code quality scanning via SonarCloud to the CI pipeline (`.github/workflows/`), reporting on code smells, duplication, and coverage for both `apps/api` and `apps/web`.

## User Story

As a maintainer,
I want automated code-quality feedback on every PR,
so that quality regressions are caught before merge.

## Acceptance Criteria

- [ ] A new (or extended) GitHub Actions workflow runs a SonarCloud scan on push/PR to `main`, consistent with the existing `ci.yml` conventions (`pnpm/action-setup@v4`, `actions/setup-node@v4` node 22, `pnpm install --frozen-lockfile`).
- [ ] Scan covers both `apps/api` and `apps/web`.
- [ ] Analysis results are visible on the PR (SonarCloud PR decoration).
- [ ] Required secrets (`SONAR_TOKEN`, project key) are documented as a manual setup step, since account/token creation can't be done by an agent.

## Definition of Ready

- [x] The objective is clearly defined.
- [x] The scope is understood.
- [x] Acceptance criteria are testable.
- [x] Major functional questions are resolved.
- [x] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
