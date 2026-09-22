# Specification

## Context

Finora currently only ingests transactions manually or via file import (`apps/api/src/import`). This idea is about live/automated bank connectivity, which is an entirely different integration surface (open banking aggregator, OAuth-like consent flow, webhooks/polling for sync). Per the task instructions, no specific provider/API/auth mechanism/sync frequency should be invented since none is defined in the repo.

## Functional Requirements

- Open questions (need a product/technical decision before this can become `ready`):
  - Which aggregator/provider (e.g. an open banking API), and which countries/banks need to be supported first?
  - Consent/authentication flow for linking an account (OAuth-style redirect? provider SDK?).
  - Sync model: real-time webhooks vs. scheduled polling, and how often.
  - How connected-account transactions reconcile with the existing manual/import flows (duplicate risk — related to FIN-015).
  - Credential/token storage and security review (this touches `.ai-context/02-auth-security.md` territory and would need its own security pass).

## Security

- Any implementation will need secrets/token storage review before going further — flagging this explicitly per `.ai-context/00-ai-instructions.md`'s guidance on auth/security-adjacent changes.

## Out of Scope

- Selecting a specific vendor/provider is a business decision outside this refinement pass.
