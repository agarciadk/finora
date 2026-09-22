---
id: FIN-005
type: bug
status: ready
priority: medium
epic: mobile-application
labels: [mobile]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-005 — [Bug] Mobile sidebar does not close after navigating to a page

## Summary

On mobile viewports, the sidebar renders as an overlay (`Sheet`-based, per `apps/web/src/components/ui/sidebar.tsx`). Tapping a navigation link navigates correctly but leaves the sidebar overlay open, covering the newly-loaded page until the user manually dismisses it.

> Note on origin: the inbox line is "Móvil: el sidebar debería ocultarse una vez se pulse sobre una página" (there is no separate "autofill" idea in the inbox or anywhere else in the repo/`.ai-context/`). This task is the closest verified match to "an existing mobile [sidebar/nav] issue" and has been confirmed by code inspection below — flagging this interpretation explicitly rather than guessing at an unrelated autofill bug.

## User Story

As a user on a mobile viewport,
I want the sidebar overlay to close automatically after I tap a navigation link,
so that I immediately see the page I navigated to instead of the sidebar covering it.

## Acceptance Criteria

- [ ] Tapping a sidebar navigation link on a mobile viewport closes the sidebar overlay.
- [ ] Desktop behavior (persistent/collapsible sidebar, not an overlay) is unchanged.
- [ ] Works for all nav items in `AppSidebar` (Dashboard/Patrimonio/Planificación/Analítica).

## Definition of Ready

- [x] The objective is clearly defined.
- [x] The scope is understood.
- [x] Acceptance criteria are testable.
- [x] Major functional questions are resolved.
- [x] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
