---
id: FIN-004
type: refactor
status: refinement
priority: high
epic:
labels: []
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-004 — Compute account balance from transactions

## Summary

The inbox asks to compute an account's balance from its actual transactions instead of the current manual field. This conflicts with a documented, deliberate design decision (`.ai-context/01-architecture.md`: `Account.balance` is described as "manual, not an accumulated ledger"), so this needs a real architectural decision, not just an implementation.

## User Story

As a user,
I want my account balance to reflect the sum of its transactions,
so that it can't drift out of sync with what I've actually recorded.

## Acceptance Criteria

- [ ] ...to be defined once the migration strategy is decided (see Specification).

## Definition of Ready

- [ ] The objective is clearly defined.
- [ ] The scope is understood.
- [ ] Acceptance criteria are testable.
- [ ] Major functional questions are resolved.
- [ ] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
