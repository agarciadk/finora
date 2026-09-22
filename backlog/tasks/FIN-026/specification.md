# Specification

## Context

Interest calculation already exists for interest-bearing (savings-style) accounts — `Account.interestRate`/`taxRate`/`interestPaymentDay`, from the "Interest-Bearing Accounts & Detail View" epic (`.ai-context/05-current-epic.md`). That calculation is for interest the user *earns*. This task is the mirror case: interest the user *owes*, for credit cards (on a carried/revolving balance) and loans (on the outstanding principal) — a different formula and direction (expense, not income).

## Functional Requirements

- Depends on FIN-024 (credit card fields) and FIN-025 (loan model) existing first.
- Open questions (need a decision before this can become `ready`):
  - Credit card interest: typically charged only on a balance carried past the due date (not on balances paid in full) — does Finora have enough data (payment history) to know whether a statement was paid in full, or does it assume interest applies to any non-zero balance at the statement date?
  - Loan interest: standard amortized-loan formula (fixed payment, interest computed against the remaining principal each period) — needs explicit confirmation this is the intended method (vs. e.g. simple interest).
  - Does computed interest get posted as an actual `Transaction` (expense), purely displayed, or both? This affects FIN-004 (balance-from-transactions) if that's pursued later.

## Business Rules

- Must not double-count against the existing savings/interest-bearing-account calculation — should be a clearly separate code path even if some math (rate application) is shared.

## Out of Scope

- Amortization schedule display — see FIN-027 (depends on this task).
