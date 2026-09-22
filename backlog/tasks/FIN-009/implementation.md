# Implementation

## Approach

Move the existing `formatIban`-style masking logic from `apps/web/src/lib/utils.ts` into the API layer (e.g. a serializer/mapper in `apps/api/src/accounts`), applied to read endpoints. Decide whether the edit form requires the user to re-enter the full IBAN (simplest, avoids ever unmasking to the client) rather than building a separate "reveal" endpoint.

## Files / Areas Affected

- `apps/api/src/accounts/accounts.service.ts` / DTOs (response mapping).
- `apps/web/src/lib/utils.ts` (remove/simplify `formatIban`).
- Any component currently calling `formatIban`.

## Implementation Steps

- [ ] Confirm all current usages of `formatIban` in `apps/web`.
- [ ] Add masking to the relevant API response mapping.
- [ ] Decide and implement the edit-flow approach (re-enter vs. reveal).
- [ ] Remove/simplify the now-redundant frontend masking.
- [ ] Update affected tests.

## Testing

- [ ] Backend unit test asserting the API response contains a masked IBAN.
- [ ] Frontend test updates for any component/test asserting on `formatIban` output.

## Validation

- [ ] `tsc`/`eslint` clean on both apps.
- [ ] Relevant Vitest/Jest suites green.

## Discovered Work (out of scope)

—

## Notes

—
