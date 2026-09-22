# Specification

## Context

Finora's current visual system is Tailwind + shadcn-style primitives on `@base-ui/react` (`.ai-context/03-ui-ux.md`), with design tokens presumably defined in `apps/web/src/globals.css`. Changing "colors, font, background" without a concrete direction is a pure product/design decision, not something to guess at.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What's wrong with the current palette/font/background, specifically? The inbox gives no direction (no target mood, no reference, no specific complaint).
  - Does this mean introducing a new font family (currently uses `font-heading` per `.ai-context/03-ui-ux.md` conventions — which font is that today, and what would replace it)?
  - Light/dark mode both need updating consistently (`ModeToggle` already exists) — a new palette must work in both.

## Out of Scope

- Account card-specific styling — see FIN-038 (related, more concrete sub-case).
