---
id: FIN-032
type: technical
status: done
priority: medium
epic: developer-experience-code-quality
labels: [ci]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-24
---

# FIN-032 — Integrate SonarQube/SonarCloud in CI

## Summary

Add static analysis/code quality scanning via SonarCloud to the CI pipeline (`.github/workflows/`), reporting on code smells, duplication, and coverage for both `apps/api` and `apps/web`.

## User Story

As a maintainer,
I want automated code-quality feedback on every PR,
so that quality regressions are caught before merge.

## Acceptance Criteria

- [x] A new (or extended) GitHub Actions workflow runs a SonarCloud scan on push/PR to `main`, consistent with the existing `ci.yml` conventions (`pnpm/action-setup@v4`, `actions/setup-node@v4` node 22, `pnpm install --frozen-lockfile`).
- [x] Scan covers both `apps/api` and `apps/web`.
- [x] Analysis results are visible on the PR (SonarCloud PR decoration) — wired via `SonarSource/sonarcloud-github-action@v3` on the `pull_request` trigger; actual PR comments only appear once `SONAR_TOKEN`/project are provisioned (see below).
- [x] Required secrets (`SONAR_TOKEN`, project key) are documented as a manual setup step, since account/token creation can't be done by an agent.

## Definition of Ready

- [x] The objective is clearly defined.
- [x] The scope is understood.
- [x] Acceptance criteria are testable.
- [x] Major functional questions are resolved.
- [x] The task contains enough context to begin implementation.

## Definition of Done

- [x] The implementation is complete.
- [x] Acceptance criteria are satisfied.
- [x] Relevant tests have been added or updated.
- [x] Relevant validation has been performed.
- [x] Documentation has been updated when necessary.
- [x] No known task-specific issues remain.
