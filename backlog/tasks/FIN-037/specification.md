# Specification

## Context

Route transitions today are handled by React Router v7 with a deliberately careful `Suspense`/preload dance to avoid a documented freeze bug (`.ai-context/04-gotchas.md`, React Router v7 section). Any animation work here must not reintroduce that already-fixed bug (React Router v7 wraps navigation in `React.startTransition`, and the existing `ROUTE_PRELOADERS` workaround is load-bearing).

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Which transitions specifically — full route/page transitions, or smaller in-page interactions (tab switches within the 5 core routes, Sheet/Dialog open-close — some of which already animate via `@base-ui/react` primitives per `.ai-context/03-ui-ux.md`)?
  - Must respect `prefers-reduced-motion` (accessibility) — not stated in the inbox but a hard requirement regardless.

## Accessibility

- Any animation must be disabled/reduced for users with `prefers-reduced-motion: reduce`.

## Out of Scope

- Reworking the existing, carefully-tuned route preloading/Suspense mechanism (`.ai-context/04-gotchas.md`) — any new animation must sit on top of it, not replace it.
