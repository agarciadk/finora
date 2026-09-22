# Specification

## Context

`apps/web/src/components/ui/sidebar.tsx` exposes `useSidebar()` with `isMobile`/`openMobile`/`setOpenMobile`, and renders a `Sheet` overlay when `isMobile` is true. `apps/web/src/components/app-sidebar.tsx`'s `handleClick` calls `onNavigate(to)` (wired to `DashboardLayout#navigateWithPendingState`) but never calls `setOpenMobile(false)`.

## Expected Behavior

After tapping a `SidebarMenuButton`/`NavLink` on a mobile viewport, the sidebar `Sheet` overlay closes so the destination page is visible.

## Actual Behavior

The overlay stays open after navigating; the user has to manually close it (e.g. tapping the backdrop) to see the page they just navigated to.

## Functional Requirements

- On mobile (`isMobile === true`), selecting a nav item must close the sidebar overlay (`setOpenMobile(false)`) in addition to navigating.
- Desktop (`isMobile === false`) must not be affected — the persistent/icon-collapsible sidebar should keep its current behavior.

## Edge Cases

- Middle-click / modifier-click (opens in a new tab) already bypasses `onNavigate` (see the early-return in `handleClick`) and must continue to leave the current tab's sidebar state untouched.

## Out of Scope

- Any other mobile navigation/layout behavior (covered separately by FIN-029, mobile-first audit).
