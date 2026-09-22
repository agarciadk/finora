# Specification

## Context

`Account` (`apps/api/prisma/schema.prisma`) already has an `AccountType.CREDIT_CARD` enum value and generic `interestRate`/`taxRate`/`interestPaymentDay` fields, but the comment on those fields explicitly says "most accounts (checking, cash, credit cards) don't earn interest" — i.e. credit cards currently have no special handling at all; `CREDIT_CARD` is just a label today.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What fields does a credit card account need beyond the generic `Account` shape? Likely candidates: credit limit, statement closing day, payment due day, current carried/statement balance — none confirmed.
  - How does "available credit" get displayed/derived, and how does it interact with `Account.balance` (which is manual today, see FIN-004)?
  - Are these fields only relevant when `type === CREDIT_CARD`, enforced at the DTO/service level (optional fields validated conditionally)?

## Data Changes

- Likely new optional fields on `Account` (credit limit, statement/due day), scoped in practice to `CREDIT_CARD` accounts — exact shape pending the decision above.

## Out of Scope

- Interest accrual on a carried balance — see FIN-026 (depends on this task).
