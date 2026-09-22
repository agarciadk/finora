# Specification

## Context

Finora's session model (`.ai-context/02-auth-security.md`) is already per-tab: `useIdleTimer`, the idle-warning modal, and `lib/session-events.ts` are explicitly self-contained/local (no shared singleton, no polling — this was a deliberate choice after a "heartbeat saga" that was tried and reverted, see `.ai-context/04-gotchas.md`). The most likely candidate for "tab sync" is propagating a logout/session-end from one tab to the others, but that isn't confirmed anywhere.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Is this about auth/session state (e.g. logging out in one tab logs out all tabs), or about UI state (theme/language already persisted via localStorage and picked up on next load — is on-the-fly sync actually needed), or about data (e.g. a created transaction in one tab reflected live in another)?
  - If it's session sync: does this conflict with the documented "no heartbeat/polling" rule? A `BroadcastChannel`/`storage`-event-based push (not polling) would respect that constraint, but needs to be confirmed as the intended mechanism.

## Out of Scope

- Any proactive/polling-based session refresh — explicitly disallowed per `.ai-context/04-gotchas.md`.
