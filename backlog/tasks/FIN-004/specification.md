# Specification

## Context

`Account.balance` is currently a manually-edited `Decimal(12,2)` field (`.ai-context/01-architecture.md` explicitly notes it is "manual, not an accumulated ledger"). This was a deliberate design choice, not an oversight. Switching to a computed/derived balance is a meaningful architecture change with real trade-offs, and is exactly the kind of decision `.ai-context/00-ai-instructions.md` says to flag rather than silently take.

## Functional Requirements

- Open questions (need a product/architecture decision before this can become `ready`):
  - Does the computed balance fully replace the manual field, or does the manual field become an "opening balance" that transactions are added on top of? (The latter is much less disruptive and lets users start an account mid-history.)
  - How do existing accounts with a manually-set balance and a partial transaction history migrate without a data-correctness regression?
  - Recurring payments, interest accrual, and imports all eventually create transactions — does this task also need to guarantee every balance-affecting event has a corresponding transaction row, or are there gaps today (e.g. interest is described as calculated for display, not necessarily posted as a transaction)?
  - Performance: is the balance computed on read (aggregate query) or maintained incrementally (e.g. updated transactionally alongside each transaction write, using `PrismaService#runInTransaction`)?

## Edge Cases

- Soft-deleted transactions (`deletedAt`) must not count towards the balance (the soft-delete Prisma extension already filters these out of normal reads, so this should fall out naturally if using standard queries — but must be verified for any aggregate/raw query).
- Bulk transaction operations (see `apps/api/src/transactions`, bulk actions mentioned in `.ai-context/05-current-epic.md`) must keep the balance consistent.

## Out of Scope

- Recomputing/backfilling historical data is only in scope once the migration strategy above is decided.
