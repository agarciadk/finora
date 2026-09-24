# Implementation

## Approach

Extracted the account edit Sheet form (previously inlined in the accounts list tab) into a standalone, reusable `AccountFormSheet` component (`apps/web/src/components/account-form-sheet.tsx`), taking `open`/`onOpenChange`/`account`/`onSubmit` props. Both `AccountsTab` (list) and the new `AccountDetailPage` "Editar" button now render the same component, so validation and field behavior stay identical between the two entry points.

The form resets its local state whenever the sheet opens for a given account (or for "create"), using React's "adjust state during render" pattern (comparing an `openKey` derived from `open`/`account.id` against the last one seen) instead of a `useEffect`, since the latter trips the repo's `react-hooks/set-state-in-effect` lint rule with no clean escape hatch for this case (see `.ai-context/04-gotchas.md`).

`useAccountDetail` gained an `updateAccount` function that `PATCH`es `/accounts/:id` and then re-fetches the full `AccountDetail` (including `stats`), since the PATCH response only returns the base `Account` shape — this keeps the detail page's displayed data (including recalculated interest stats) in sync after a save, consistent with the existing fetch-then-render pattern used elsewhere in the app.

## Files / Areas Affected

- `apps/web/src/components/account-form-sheet.tsx` (new): extracted, reusable edit/create Sheet form.
- `apps/web/src/components/wealth/accounts-tab.tsx`: now renders `AccountFormSheet` instead of an inlined form.
- `apps/web/src/pages/account-detail-page.tsx`: added an "Editar" button that opens `AccountFormSheet` for the current account.
- `apps/web/src/hooks/use-account-detail.ts`: added `updateAccount`.
- `apps/web/test/components/account-form-sheet.test.tsx` (new): Vitest coverage for create/edit/prefill behavior.
- `apps/web/e2e/tests/interest-bearing-accounts.spec.ts`: added an e2e test for editing an account from the detail page.

## Implementation Steps

- [x] Confirm whether the account edit form is already a standalone, reusable component; extract it if it's inlined in the list page.
- [x] Add an "Edit" entry point on the account detail page that opens the same form.
- [x] Verify all fields (including iban/interest fields) are present and behave identically to the list's edit flow.

## Testing

- [x] Frontend test covering opening/submitting the edit form from the detail page (`account-form-sheet.test.tsx` unit tests + a new Playwright e2e test in `interest-bearing-accounts.spec.ts`).

## Validation

- [x] `tsc --noEmit` clean (`pnpm --filter @finora/web typecheck`).
- [x] `pnpm lint` clean (repo-wide).
- [x] `pnpm test` (Vitest): 58/58 passed.
- [x] `pnpm test:e2e` (Playwright): 33/33 passed.
- [x] `pnpm test:a11y` (Playwright + axe-core): 12/12 passed.

## Discovered Work (out of scope)

- Pre-existing, unrelated console warning during e2e runs: "Base UI: A component that acts as a button expected a native `<button>`..." from the account detail page's existing back button (`<Button ... render={<Link to="/patrimonio" />}>`), untouched by this task. Logged to `backlog/inbox.md`.

## Notes

—
