# Specification

## Context

Finora is a personal finance app handling sensitive financial data; adding user-behavior tracking has real privacy implications (GDPR, since UI is in Spanish/likely EU users) that go beyond a simple tool integration.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Which tool (self-hosted like Plausible/PostHog vs. third-party like GA4)? Nothing is decided.
  - Consent/cookie-banner requirements — does this need a consent flow given `.ai-context/02-auth-security.md`'s existing strict CSP (`helmet()`, `connect-src` restricted to `CORS_ORIGIN`)? Any third-party analytics domain would need explicit CSP allowances.
  - What's actually being measured (page views, feature usage, funnels)?

## Security

- Any third-party analytics script must be reconciled with the existing CSP (`.ai-context/02-auth-security.md`) — do not silently loosen `unsafe-inline`/`connect-src` without review.

## Out of Scope

- Backend HTTP request logging — see FIN-031, a separate, already-scoped task in the `developer-experience-code-quality` epic.
