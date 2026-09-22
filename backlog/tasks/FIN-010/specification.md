# Specification

## Context

`MailService` already exists (`ResendMailService`, per `.ai-context/02-auth-security.md`) and is used for verification/password-reset emails; if `RESEND_API_KEY` is unset today it only logs the link. This suggests sending infrastructure (Resend) is already partially set up — the gap is likely a verified sending domain/account rather than a new provider integration.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Is Resend (already integrated) the intended provider going forward, or is a switch being considered?
  - What domain will emails be sent from, and who owns/can verify DNS records (SPF/DKIM/DMARC) for it?
  - Is this purely infra setup (domain + API key in production env vars, already listed as a manual step in `.ai-context/01-architecture.md`'s deployment section) or does it also require code changes?

## Out of Scope

- The newsletter feature itself — see FIN-011.
