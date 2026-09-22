# Implementation

## Approach

Cannot be finalized yet — depends on the `Account` vs. standalone `Loan` model decision in `specification.md`, which is a real architectural fork (not just a details question).

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (+ migration) — new enum value and/or new model.
- `apps/api/src/accounts/` or a new `apps/api/src/loans/` module.
- `apps/web/src/` corresponding UI.

## Implementation Steps

- [ ] Resolve the `Account` vs. standalone `Loan` model decision in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
