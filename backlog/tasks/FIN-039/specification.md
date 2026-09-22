# Specification

## Context

Finora has no billing/payment infrastructure today (no Stripe/payment provider integration anywhere in `apps/api`). This is a foundational business/product decision before any engineering can start.

## Functional Requirements

- Open questions (need a business decision before this can become `ready`):
  - What's gated behind payment? Nothing is specified — no feature list exists distinguishing "free" vs. "paid".
  - Payment provider (e.g. Stripe)? Not chosen.
  - Pricing model (one-time, subscription, tiers)? Not chosen.
  - Relationship to FIN-040 (ads) — a common pattern is "ads on free tier, no ads on paid tier", which would need to be an explicit decision, not assumed.

## Security

- Any payment integration must follow PCI-DSS-relevant best practices (never handle raw card data directly — use the provider's hosted checkout/tokenization).

## Out of Scope

- Implementing anything before pricing/gating/provider are decided.
