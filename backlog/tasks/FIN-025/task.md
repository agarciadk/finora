---
id: FIN-025
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

# FIN-025 — Loan accounts

## Summary

Add a way to model a loan in Finora (principal, term, rate) as a new kind of account. No `LOAN` value currently exists in `AccountType`, and there are no loan-specific fields anywhere in the schema.

## User Story

As a user with a personal loan or mortgage,
I want to add it to Finora with its principal, rate and term,
so that Finora can track what I owe and (later) show me an amortization schedule.

## Acceptance Criteria

- [ ] ...to be defined once the data model/business rules are decided (see Specification).

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
