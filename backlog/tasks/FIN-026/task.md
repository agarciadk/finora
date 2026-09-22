---
id: FIN-026
type: feature
status: refinement
priority: medium
epic: loans-and-credit
labels: []
depends_on: [FIN-024, FIN-025]
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-026 — Interest calculation for credit cards and loans

## Summary

Compute interest for credit card carried balances and loan principals. Distinct from the existing interest-bearing (savings-style) account calculation already implemented — that one computes interest *earned*; this one computes interest *owed/charged*.

## User Story

As a user with a loan or a credit card balance,
I want Finora to show me how much interest I'm being charged,
so that I understand the real cost of carrying that balance/loan.

## Acceptance Criteria

- [ ] ...to be defined once FIN-024/FIN-025's data models exist and the calculation method is decided (see Specification).

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
