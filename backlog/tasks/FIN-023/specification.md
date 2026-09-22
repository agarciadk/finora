# Specification

## Context

The recurring payment form currently uses a plain numeric amount input (money fields are decimal strings end-to-end per `.ai-context/00-coding-skills.md`). A range/slider input works well for bounded values, but a payment amount is inherently unbounded/user-specific — a slider needs sensible min/max bounds to be usable, which aren't defined.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What are the min/max bounds of the range? A fixed bound (e.g. €0–€5,000) would misfit outlier amounts (e.g. a large loan-adjacent payment); a dynamic bound (e.g. relative to the account balance or past amounts) is more complex and undefined.
  - Does the range selector replace the numeric input entirely, or supplement it (slider + editable number in sync)? Full replacement risks precision issues for exact amounts (e.g. €49.99).

## Out of Scope

- Changing the amount input pattern anywhere else in the app (transactions, budgets) — scoped to recurring payments only, per the inbox wording.
