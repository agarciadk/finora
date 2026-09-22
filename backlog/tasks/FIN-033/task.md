---
id: FIN-033
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

# FIN-033 — Integrate Semgrep into the Husky pre-commit hook

## Summary

Add a Semgrep static-analysis security scan to the existing Husky pre-commit hook, alongside the current lint+test+e2e+a11y suite (`.ai-context/04-gotchas.md`).

## User Story

As a maintainer,
I want common security anti-patterns caught before a commit is even made,
so that issues are fixed at the earliest possible point instead of in CI/review.

## Acceptance Criteria

- [ ] Semgrep runs as part of the existing pre-commit hook (or a fast-enough subset of it) using a reasonable default/recommended ruleset.
- [ ] A commit is blocked if Semgrep reports a finding at or above an agreed severity (needs to reuse a standard ruleset rather than a custom one, to avoid inventing security policy).
- [ ] Pre-commit hook runtime stays reasonable — the existing hook already takes ~50s-1m20s (`.ai-context/04-gotchas.md`); Semgrep shouldn't push this to an unusable duration (e.g. consider running Semgrep only on changed files).

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
