# Specification

## Context

Finora already has some responsive behavior (the collapsible/`Sheet`-based sidebar on mobile per `.ai-context/03-ui-ux.md`/`sidebar.tsx`), and FIN-005 already identifies one concrete mobile navigation bug. But "mobile first" as a design principle (vs. a handful of responsive fixes) is broader and undefined in scope.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Which pages/flows are in scope for this audit? The 5 core routes (`/`, `/patrimonio`, `/planificacion`, `/analitica`, `/ajustes`, per `.ai-context/05-current-epic.md`'s Tabs Migration epic) all have dense tables/forms/charts that may not fit small screens well — an actual audit (not assumptions) is needed to produce a concrete list.
  - Does "mobile first" mean redesigning the CSS approach (e.g. writing styles mobile-up instead of desktop-down), or just fixing specific broken/cramped layouts? These are different-sized efforts.

## Out of Scope

- The hybrid app wrapper itself — see FIN-030.
- The specific sidebar-close bug — already tracked as FIN-005.
