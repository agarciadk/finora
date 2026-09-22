# Specification

## Context

Today, per the routing described in `.ai-context/03-ui-ux.md`, unauthenticated visitors only ever see `login`/`register`/password-recovery pages. There's no marketing content, feature overview, or public route.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What content/sections does the landing page need (feature highlights, pricing — depends on FIN-039/monetization, screenshots)?
  - Visual direction is undefined (relates to `visual-identity-refresh` epic) — building a landing page before/without a design direction risks needing a redo.
  - Routing: does `/` redirect logged-out users to this new landing page while keeping `/` as the dashboard for logged-in users, or does it get its own route?

## Out of Scope

- Final visual design — depends on decisions from the `visual-identity-refresh` epic.
