# Specification

## Context

`AccountType` today is `CHECKING | SAVINGS | CREDIT_CARD | CASH` — there is no `LOAN` type, and no fields for principal/term/monthly payment anywhere in `Account` or elsewhere in the schema. This is a genuinely new concept, not an extension of an existing one.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - New `AccountType.LOAN`, or a separate `Loan` model entirely (not an `Account` subtype)? A loan behaves quite differently from a checking/savings/credit-card account (it has a decreasing principal, a fixed term, no day-to-day transactions in the usual sense) — modeling it as its own entity may fit better than forcing it into `Account`.
  - Required fields: principal amount, interest rate, term (months/years), start date, payment frequency — how much of this overlaps with `RecurringPayment` (a loan's monthly payment could conceptually be a `RecurringPayment` row) vs. needing its own fields?
  - How does a loan's `balance`/remaining principal relate to `Account.balance` (manual field, see FIN-004) if modeled as an `Account`?

## Data Changes

- Either a new `AccountType.LOAN` + new optional `Account` fields, or a brand-new `Loan` model — pending the decision above.

## Out of Scope

- Interest calculation and amortization — see FIN-026 and FIN-027 (both depend on this task).
