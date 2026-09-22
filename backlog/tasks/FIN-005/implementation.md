# Implementation

## Approach

Call `setOpenMobile(false)` (from `useSidebar()`) inside `AppSidebar`'s `handleClick`, guarded so it only applies when `isMobile` is true (or unconditionally, since `setOpenMobile` should be a no-op on desktop — verify against `sidebar.tsx`).

## Files / Areas Affected

- `apps/web/src/components/app-sidebar.tsx`
- `apps/web/test/components/app-sidebar.test.tsx` (new)

## Implementation Steps

- [x] Read `use-sidebar`/`SidebarProvider` implementation in `sidebar.tsx` to confirm `setOpenMobile`'s exact contract.
- [x] Call `setOpenMobile(false)` from `AppSidebar#handleClick` after `onNavigate(to)`, guarded by `isMobile`.
- [x] Verified the mobile-close/desktop-unaffected behavior via the automated component test below (no manual devtools check was performed).

## Testing

- [x] Added `apps/web/test/components/app-sidebar.test.tsx`: mocks `window.matchMedia`/`window.innerWidth` to simulate mobile vs. desktop, opens the `Sheet` via `SidebarTrigger`, clicks a nav link, and asserts the dialog closes on mobile while the desktop sidebar is unaffected.

## Validation

- [x] `pnpm test` (root, runs `@finora/test` → Vitest for `apps/web`): 15 files, 55 tests passed.
- [x] `pnpm --filter web exec tsc --noEmit`: clean.
- [x] `pnpm --filter web exec eslint .`: clean.

## Discovered Work (out of scope)

—

## Notes

`isMobile` guard is not strictly required since `setOpenMobile` is a no-op on desktop (its value is simply unused when `Sidebar` renders the non-mobile branch), but it keeps the intent explicit and matches the acceptance criteria wording.
