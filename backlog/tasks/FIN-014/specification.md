# Specification

## Context

Finora's current auth (`.ai-context/02-auth-security.md`) is email+password with JWT access + rotating refresh cookies. Adding OAuth providers is a substantial addition to `apps/api/src/auth` (new strategies, account-linking rules) and to the frontend login/register pages.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Confirm "iOS" means Sign in with Apple, not something else (e.g. a native iOS app login, which doesn't exist yet — see `mobile-application` epic).
  - Account linking: what happens when an OAuth email matches an existing password-based account? Auto-link, block, or ask?
  - Does OAuth login bypass the existing `emailVerified` gate (providers already verify email) — needs an explicit rule.
  - Session/cookie behavior should reuse the existing JWT+refresh-token pattern rather than introducing a second auth mechanism — needs confirming this is acceptable.

## Security

- OAuth introduces a new attack surface (redirect URI validation, state/CSRF parameter, token exchange) — must be reviewed against `.ai-context/02-auth-security.md`'s existing hardening (helmet CSP, cookie flags) before implementation.

## Out of Scope

- Any provider beyond Google/Apple unless requested later.
