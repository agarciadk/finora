# Specification

## Context

The `NotificationPreference` model already has a `PRODUCT_NEWS` enum value (`.ai-context/01-architecture.md`), implying opt-in was anticipated but never built out. The inbox itself calls this "possible" ("Posible newsletter"), signaling low confidence/priority.

## Functional Requirements

- Open questions (need a product decision before this can become `ready`):
  - What content goes in a newsletter, and how often is it sent (this is editorial/product work, not just engineering)?
  - Is this a manually-triggered send (admin action) or scheduled?
  - Depends on FIN-010 (dedicated sending domain) being resolved first.

## Out of Scope

- Building a full CMS/email-template editor — out of scope unless explicitly requested later.
