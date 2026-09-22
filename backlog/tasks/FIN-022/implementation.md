# Implementation

## Approach

Add the nullable `endDate` field via a Prisma migration, extend the recurring payments DTOs with validation (`endDate >= startDate`), and update whatever logic computes "next due" payments to respect it.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (+ migration)
- `apps/api/src/recurring-payments/` (DTOs, service logic for next-due computation)
- `apps/web/src/components/` recurring payment form (add end date input)

## Implementation Steps

- [ ] Add `endDate` field + migration.
- [ ] Add validation (`endDate >= startDate`) to create/update DTOs.
- [ ] Update next-due-payment logic to exclude occurrences past `endDate`.
- [ ] Add an end date input to the recurring payment create/edit form.

## Testing

- [ ] Backend unit tests: DTO validation, next-due logic with/without `endDate`.
- [ ] Frontend test for the new form field.

## Validation

- [ ] `tsc`/`eslint` clean on both apps.
- [ ] Relevant Jest/Vitest suites green.

## Discovered Work (out of scope)

—

## Notes

—
