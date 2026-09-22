# Specification

## Context

Finora is a personal-finance app displaying sensitive financial data; introducing third-party ad scripts has real privacy/CSP implications (the backend already enforces a strict `helmet()` CSP per `.ai-context/02-auth-security.md`) and product-tone implications (ads next to bank balances is a real UX/trust consideration worth flagging, not deciding here).

## Functional Requirements

- Open questions (need a business decision before this can become `ready`):
  - Ad network/provider — not chosen.
  - Placement — which pages/screens show ads, and how that coexists with a dense financial-data UI.
  - Interaction with FIN-039 (payment layer) — does a paid tier remove ads? Needs an explicit decision, not an assumption.

## Security

- Any third-party ad script requires reconciling with the existing CSP (`.ai-context/02-auth-security.md`) — do not silently loosen `connect-src`/`script-src` without a review.

## Out of Scope

- Implementing anything before ad network/placement/tier-interaction are decided.
