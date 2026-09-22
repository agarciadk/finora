# Implementation

## Approach

Call `setOpenMobile(false)` (from `useSidebar()`) inside `AppSidebar`'s `handleClick`, guarded so it only applies when `isMobile` is true (or unconditionally, since `setOpenMobile` should be a no-op on desktop — verify against `sidebar.tsx`).

## Files / Areas Affected

- `apps/web/src/components/app-sidebar.tsx`
- Possibly `apps/web/src/components/ui/sidebar.tsx` if `setOpenMobile` needs to be consumed differently.

## Implementation Steps

- [ ] Read `use-sidebar`/`SidebarProvider` implementation in `sidebar.tsx` to confirm `setOpenMobile`'s exact contract.
- [ ] Call `setOpenMobile(false)` from `AppSidebar#handleClick` after `onNavigate(to)`.
- [ ] Manually verify on a mobile viewport (devtools responsive mode) that the overlay closes on tap, and that desktop is unaffected.

## Testing

- [ ] Add/extend a component test for `AppSidebar` (or an e2e test) covering the mobile-close behavior, per repo convention (`apps/web/test/components/`).

## Validation

- [ ] `pnpm --filter web test` (or the equivalent Vitest command for this repo).
- [ ] Manual check in responsive/mobile emulation.

## Discovered Work (out of scope)

—

## Notes

—
