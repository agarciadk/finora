# Implementation

## Approach

Moved the `formatIban`-style masking logic from `apps/web/src/lib/utils.ts` into `apps/api/src/accounts/accounts.service.ts`, applied to every response that returns an `Account` (`findAll`, `findOne`, `create`, `update`). The edit flow uses the "re-enter the full value" option (no reveal endpoint): the IBAN input in the edit sheet always starts empty, with a hint showing the masked current IBAN and explaining that leaving it blank keeps it unchanged. Since the field is optional and omitted (`undefined`) values are dropped before the PATCH request, an untouched field never overwrites the stored IBAN with a masked string.

## Files / Areas Affected

- `apps/api/src/accounts/accounts.service.ts` — added `maskIban`/`maskAccount` helpers, applied to `findAll`/`findOne`/`create`/`update` responses.
- `apps/api/src/accounts/accounts.service.spec.ts` — new "IBAN masking" test suite.
- `apps/web/src/lib/utils.ts` — removed `formatIban` (masking now happens server-side).
- `apps/web/src/components/wealth/accounts-tab.tsx` — renders `account.iban` directly (already masked); edit sheet no longer prefills the IBAN field with the (now masked) value, and shows a hint with the masked current IBAN instead.
- `apps/web/src/i18n/locales/{en,es}/translation.json` — added `accounts.form.ibanEditHint`.

## Implementation Steps

- [x] Confirm all current usages of `formatIban` in `apps/web`.
- [x] Add masking to the relevant API response mapping.
- [x] Decide and implement the edit-flow approach (re-enter vs. reveal) — chose re-enter (simplest, matches spec recommendation).
- [x] Remove/simplify the now-redundant frontend masking.
- [x] Update affected tests.

## Testing

- [x] Backend unit tests asserting `findAll`/`findOne`/`create`/`update` responses contain a masked IBAN, and that a `null` IBAN is left unchanged (`accounts.service.spec.ts`).
- [x] No frontend test referenced `formatIban` or IBAN directly, so none needed updating; full Vitest suite re-run to confirm no regressions.

## Validation

- `pnpm --filter @finora/api test` — 27/27 suites, 179/179 tests passed.
- `pnpm --filter @finora/api lint` — clean.
- `pnpm --filter @finora/web typecheck` — clean.
- `pnpm --filter @finora/web lint` — clean.
- `pnpm test` (`@finora/test` Vitest) — 14 files, 53/53 tests passed.

## Discovered Work (out of scope)

—

## Notes

`apps/api/src/accounts/dto/create-account.dto.ts`/`update-account.dto.ts` and the `@IsIBAN()` validation are unchanged — masking only happens on the response side, so writes still validate/store the full IBAN.

