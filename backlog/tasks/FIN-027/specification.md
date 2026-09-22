# Specification

## Context

An amortization schedule is a direct consequence of the loan model (FIN-025) and interest formula (FIN-026) — it can't be specified independently of those decisions, particularly whether loans use standard fixed-payment amortization.

## Functional Requirements

- Depends entirely on FIN-025 (loan data model) and FIN-026 (interest calculation method).
- Open questions (need a decision before this can become `ready`):
  - Display as a table (per-period principal/interest/remaining balance) on the loan's account detail page, following the existing account detail page pattern (`.ai-context/05-current-epic.md`)?
  - Does the schedule need to react to extra/early payments, or is it a static projection based on the original terms?

## Out of Scope

- Any UI beyond a read-only schedule view, unless requested later (e.g. no "what-if" extra-payment simulator).
