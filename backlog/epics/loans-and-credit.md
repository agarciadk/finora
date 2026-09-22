---
id: loans-and-credit
title: Loans & Credit
status: active
created_at: 2026-09-22
updated_at: 2026-09-22
---

# loans-and-credit — Loans & Credit

## Summary

Extends Finora's account model beyond the existing interest-bearing (savings-style) accounts to cover credit cards and loans: credit card specific fields/behavior, loan accounts, interest accrual for both, and a loan amortization schedule. Groups the two overlapping inbox ideas "Meter préstamos, tarjeta de créditos y el cálculo del ingreso de intereses" and "Meter lógica de préstamos para cálculo de intereses, plan de amortización", decomposed into independent units of work.

Note: interest calculation for **savings/interest-bearing accounts** already exists (`Account.interestRate`/`taxRate`/`interestPaymentDay`, "Interest-Bearing Accounts & Detail View" epic, see `.ai-context/05-current-epic.md`). This epic only covers credit cards and loans, which are not modeled yet.

## Tasks

- [ ] FIN-024 — Credit card accounts: limit, statement/due date
- [ ] FIN-025 — Loan accounts
- [ ] FIN-026 — Interest calculation for credit cards and loans
- [ ] FIN-027 — Loan amortization schedule

## Notes

- FIN-026 depends on FIN-024/FIN-025 existing (needs the account fields to compute against). FIN-027 depends on FIN-025/FIN-026.
- FIN-022 (recurring payments end date) is `related_to` this epic — the inbox explicitly frames it as a stand-in "until leasing/renting/loan logic exists".
- All four tasks are left in `refinement`: none of the required business rules (credit limit enforcement, minimum payment logic, interest accrual method, amortization schedule type) are defined anywhere in `.ai-context/` or the inbox — they need a product decision before implementation can start.
