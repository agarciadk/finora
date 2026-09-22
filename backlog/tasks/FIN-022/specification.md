# Specification

## Context

`RecurringPayment` currently has `startDate`/`nextPaymentDate`/`isActive` but no end date (`apps/api/prisma/schema.prisma`). The inbox is explicit that this is a stopgap: "mientras no se meta lógica de leasing/renting/préstamo" (until leasing/renting/loan logic is added) — so this should stay a simple date boundary, not attempt to model amortization/remaining-balance logic (that belongs to the `loans-and-credit` epic).

## Functional Requirements

- Add `endDate DateTime?` to `RecurringPayment`.
- Validate `endDate >= startDate` at the DTO level (`class-validator`).
- The "next payment"/due-date computation logic must treat a payment whose next occurrence would fall after `endDate` as no longer due (exact UI treatment — hidden vs. shown as "ended" — is an implementation detail, not a product ambiguity, since the inbox only asks for the date to stop future occurrences).

## Data Changes

- Migration: add nullable `endDate` column to `RecurringPayment`.

## Edge Cases

- `endDate` exactly equal to `nextPaymentDate`: that occurrence should still be considered valid/due (inclusive boundary), only occurrences strictly after `endDate` are excluded.
- Existing recurring payments (no `endDate`) must keep behaving exactly as today.

## Out of Scope

- Any loan/leasing-specific logic (amortization, remaining balance) — see the `loans-and-credit` epic.
