---
id: FIN-022
type: feature
status: review
priority: medium
epic: recurring-payments-enhancements
labels: []
depends_on: []
related_to: [loans-and-credit]
created_at: 2026-09-22
updated_at: 2026-09-24
---

# FIN-022 — Optional end date for recurring payments

## Summary

Add an optional end date to `RecurringPayment`, so a recurring payment stops generating/advancing once past that date. The inbox explicitly frames this as a temporary measure "while loan/leasing logic doesn't exist yet" (`related_to` the `loans-and-credit` epic) — it's intentionally scoped as a simple date field, not a full loan model.

## User Story

As a user with a recurring payment that has a known end (e.g. a 24-month gym contract, a lease),
I want to set an end date,
so that Finora stops expecting/showing it as due after that date.

## Acceptance Criteria

- [x] `RecurringPayment` gains an optional `endDate`.
- [x] The create/edit form lets the user set/clear an end date.
- [x] A recurring payment past its `endDate` no longer appears as due/upcoming (e.g. excluded from "next payment" widgets, or shown as ended — exact list of affected surfaces determined during implementation from `RecurringPayment`'s current usages).
- [x] `endDate` is optional — existing recurring payments without one are unaffected.
- [x] `endDate` must not be before `startDate` (validated).

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
