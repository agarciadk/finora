---
id: recurring-payments-enhancements
title: Recurring Payments Enhancements
status: active
created_at: 2026-09-22
updated_at: 2026-09-22
---

# recurring-payments-enhancements — Recurring Payments Enhancements

## Summary

Groups three related improvements to the existing `RecurringPayment` feature (see `.ai-context/05-current-epic.md`, "Recurring Payments & Subscriptions" epic): removing the need to manually mark some payments as paid, adding an optional end date, and revisiting the amount input as a range selector.

## Tasks

- [ ] FIN-021 — Recurring payments without a manual "mark as paid" step
- [ ] FIN-022 — Optional end date for recurring payments
- [ ] FIN-023 — Range-selector amount input for recurring payments

## Notes

- FIN-022 is `related_to` the `loans-and-credit` epic — the inbox explicitly frames the end date as a temporary measure "until leasing/renting/loan logic is added".
- FIN-021 and FIN-023 remain in `refinement`: both need a product decision (respectively: how the system decides a payment happened automatically; and the bounds/behavior of a range input for an otherwise free-form amount) before they're actionable.
