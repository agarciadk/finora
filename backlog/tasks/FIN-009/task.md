---
id: FIN-009
type: refactor
status: done
priority: high
epic:
labels: [security]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-009 — Mask sensitive data in the backend instead of the frontend

## Summary

Sensitive fields (e.g. IBAN, masked today as `ES91 •••• •••• •••• 1332` client-side via `formatIban` per `.ai-context/05-current-epic.md`) are currently masked in `apps/web`. Move the masking to the API response instead, so the raw value never reaches the browser for fields that only need to be displayed masked.

## User Story

As a user,
I want sensitive account data to never leave the server unmasked when the UI only ever displays a masked version,
so that a compromised frontend/browser extension/network inspection can't expose the full value.

## Acceptance Criteria

- [x] The API returns already-masked values for fields that are only ever displayed masked in the UI (starting with `Account.iban`).
- [x] `apps/web`'s `formatIban` (or equivalent) is removed/simplified since masking no longer happens client-side.
- [x] Any endpoint/flow that legitimately needs the raw value (e.g. an edit form pre-fill, if applicable) is explicitly identified and handled — full IBAN must still be enterable/editable where needed.
- [x] Existing tests referencing client-side masking are updated.

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
