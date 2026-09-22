---
id: FIN-019
type: improvement
status: done
priority: medium
epic:
labels: []
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-019 — Edit all account fields from the account detail view

## Summary

The account detail page (`GET /accounts/:id`, per `.ai-context/05-current-epic.md`'s "Interest-Bearing Accounts & Detail View" epic) currently doesn't expose the same editable fields as the accounts list. Bring edit parity between the two.

## User Story

As a user viewing an account's detail page,
I want to edit the same fields I can edit from the accounts list,
so that I don't have to go back to the list just to make a change.

## Acceptance Criteria

- [x] The account detail page allows editing every field currently editable from the accounts list Sheet (name, bank, type, currency, iban, interest fields, etc.).
- [x] Editing from the detail page uses the same validation/behavior as editing from the list (no divergent rules).
- [x] Saving from the detail page updates the displayed data in place without requiring a full page reload.

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
