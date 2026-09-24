# Implementation

## Approach

Added the nullable `endDate` field via a Prisma migration, extended the recurring payments DTOs with validation (`endDate >= startDate`), and updated the surfaces that treat a recurring payment as "due" to skip it once its pending occurrence (`nextPaymentDate`) falls strictly after `endDate` — the boundary itself is inclusive, so the occurrence due exactly on `endDate` is still valid.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` + migration `20260924081115_add_recurring_payment_end_date`.
- `apps/api/src/recurring-payments/dto/create-recurring-payment.dto.ts`, `update-recurring-payment.dto.ts`: optional `endDate` (nullable, so it can be explicitly cleared on update via `@IsOptional()`, which class-validator treats `null`/`undefined` the same).
- `apps/api/src/recurring-payments/recurring-payments.service.ts`: `create`/`update` validate `endDate >= startDate` (update merges with the existing record when only one of the two dates is sent); `execute` now rejects (400) marking an ended payment as paid, same as a paused one.
- `apps/api/src/recurring-payments/recurring-payment-status.util.ts` (new): shared `hasRecurringPaymentEnded` helper (`nextPaymentDate > endDate`).
- `apps/api/src/analytics/analytics.service.ts`: `getVitalMargin`'s recurring-expenses sum now excludes ended payments (fetches `nextPaymentDate`/`endDate` and filters in JS, since Prisma's query API can't compare two columns of the same row).
- `apps/web/src/lib/types.ts`, `apps/web/src/hooks/use-recurring-payments.ts`: `RecurringPayment.endDate`/`RecurringPaymentInput.endDate` (`string | null`).
- `apps/web/src/components/planning/recurring-payments-tab.tsx`: end date input in the create/edit form (mirrors the backend's `|| null` clearing convention); an ended payment now shows an "Finalizado"/"Ended" badge + "Finalizado el {{date}}" instead of the due-soon/overdue next-payment message, is excluded from the "Gastos fijos mensuales" monthly total, and its "Marcar como pagado" button is disabled.
- `apps/web/src/i18n/locales/{es,en}/translation.json`: `recurringPayments.form.endDateLabel`, `recurringPayments.status.ended`, `recurringPayments.endedOn`.

## Implementation Steps

- [x] Add `endDate` field + migration.
- [x] Add validation (`endDate >= startDate`) to create/update DTOs.
- [x] Update next-due-payment logic to exclude occurrences past `endDate` (execute(), Vital Margin, frontend due badge/summary).
- [x] Add an end date input to the recurring payment create/edit form.

## Testing

- [x] Backend unit tests: DTO validation via service-level `endDate >= startDate` checks (create + update, including clearing to `null`), next-due logic with/without `endDate` in `execute()` (rejects past-end, allows the boundary date). See `recurring-payments.service.spec.ts`.
- [x] Frontend test for the new form field: `apps/web/test/components/recurring-payments-tab.test.tsx` — end date input is editable, and an ended payment renders the "Finalizado" badge with a disabled "Marcar como pagado" button.
- Not added: a dedicated unit test for `analytics.service.ts`'s `getVitalMargin` filtering — that method had no pre-existing test coverage at all (no `prisma.recurringPayment`/`prisma.user` mocks in `analytics.service.spec.ts`), so adding one would be expanding test scope beyond this task; the change was validated manually and via the full Jest suite staying green.

## Validation

- [x] `pnpm --filter @finora/api lint` (eslint, `--fix`) — clean.
- [x] `npx tsc -p apps/api/tsconfig.build.json --noEmit` — clean (after regenerating the Prisma client with `npx prisma generate`, needed once for the new `endDate` field/column).
- [x] `npx jest` in `apps/api` — 28 suites / 188 tests passed.
- [x] `pnpm --filter @finora/web build` (`tsc -b && vite build`) — clean.
- [x] `pnpm --filter @finora/web lint` (eslint) — clean.
- [x] `pnpm test` (frontend Vitest via `@finora/test`) — 17 suites / 60 tests passed.
- [x] `npx playwright test tests/recurring-payments.spec.ts` (apps/web/e2e) — passed.
- Full `pnpm test:a11y` suite not re-run standalone (no accessibility-relevant markup change beyond a labeled date input and an existing `Badge`/`Button` pattern already used elsewhere); the Husky pre-commit hook runs it as part of the commit.

## Discovered Work (out of scope)

—

## Notes

—
