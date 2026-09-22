# Implementation

## Approach

Extract/reuse the existing account edit Sheet form component (currently used from the accounts list) and wire it up from the account detail page, rather than duplicating form logic.

## Files / Areas Affected

- `apps/web/src/pages/` (account detail page)
- `apps/web/src/components/` (shared account edit Sheet form, if not already a standalone component — extract it if it's currently inlined in the list page)

## Implementation Steps

- [ ] Confirm whether the account edit form is already a standalone, reusable component; extract it if it's inlined in the list page.
- [ ] Add an "Edit" entry point on the account detail page that opens the same form.
- [ ] Verify all fields (including iban/interest fields) are present and behave identically to the list's edit flow.

## Testing

- [ ] Frontend test covering opening/submitting the edit form from the detail page.

## Validation

- [ ] `tsc`/`eslint` clean.
- [ ] Relevant Vitest suite green.

## Discovered Work (out of scope)

—

## Notes

—
