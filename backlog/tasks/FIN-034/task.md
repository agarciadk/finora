---
id: FIN-034
type: technical
status: ready
priority: medium
epic: developer-experience-code-quality
labels: [ci, security]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-034 — Enable CodeQL on GitHub

## Summary

Enable GitHub's CodeQL code scanning for the repository, covering both JavaScript/TypeScript codebases (`apps/api`, `apps/web`).

## User Story

As a maintainer,
I want CodeQL scanning findings surfaced on GitHub (Security tab / PR checks),
so that known vulnerability patterns are caught automatically.

## Acceptance Criteria

- [ ] A `.github/workflows/codeql.yml` workflow is added, using `github/codeql-action`, analyzing the `javascript-typescript` language pack.
- [ ] Runs on push/PR to `main` and on a schedule, consistent with GitHub's default CodeQL setup pattern.
- [ ] Findings surface in the repository's Security tab.
- [ ] Repository-level "Code scanning" enablement (if using GitHub's default setup instead of an in-repo workflow) is documented as a manual step requiring admin access.

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
