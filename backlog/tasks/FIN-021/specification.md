# Specification

## Context

`RecurringPayment` (`apps/api/prisma/schema.prisma`) has `nextPaymentDate`/`isActive`, advanced today via a manual "mark as paid" action (per `.ai-context/05-current-epic.md`, "Recurring Payments & Subscriptions" epic, "drift-free date logic" was already a concern there). This idea asks for at least some recurring payments to skip that manual step and auto-advance (and presumably auto-create the corresponding `Transaction`).

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Should this be a per-recurring-payment opt-in flag (e.g. `autoConfirm: boolean`), or apply to all recurring payments unconditionally? The inbox phrasing ("pagos recurrentes sin botón") could mean either "remove the button entirely" or "some payments don't need it" — ambiguous.
  - If auto-advanced: does the system create a real `Transaction` automatically when `nextPaymentDate` passes, or only silently advance the date without touching account balances/transaction history? This has real financial-accuracy implications and must be explicit.
  - Trigger mechanism: a scheduled job (cron) checking due dates, vs. computed lazily on next read? No background job infrastructure is documented in `.ai-context/` today — introducing one is a new architectural piece.

## Business Rules

- Whatever mechanism is chosen must preserve the existing "drift-free date logic" already implemented for recurring payments (per `.ai-context/05-current-epic.md`) — don't reintroduce date drift.

## Out of Scope

- Changing recurring payments that the user wants to keep manually confirming.
