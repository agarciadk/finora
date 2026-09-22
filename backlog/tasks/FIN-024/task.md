---
id: FIN-024
type: feature
status: refinement
priority: medium
epic: loans-and-credit
labels: []
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-024 — Credit card accounts: limit, statement/due date

## Summary

`AccountType.CREDIT_CARD` already exists in the schema but has no credit-card-specific fields (credit limit, statement/due date) or behavior — it's treated like any other account today. This task adds the data model and behavior specific to credit cards, as a foundation for FIN-026 (interest calculation).

## User Story

As a user with a credit card,
I want to record its credit limit and billing cycle,
so that Finora can show my available credit and (later) compute interest on any carried balance.

## Acceptance Criteria

- [ ] ...to be defined once the business rules below are decided (see Specification).

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
