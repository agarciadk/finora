# Implementation

## Approach

Cannot be finalized yet — depends on the field/behavior decisions in `specification.md`. Likely additive Prisma fields on `Account` plus conditional DTO validation (`ValidateIf` on `type === CREDIT_CARD`), following the existing pattern for the optional interest fields.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (+ migration)
- `apps/api/src/accounts/`
- `apps/web/src/components/` account form/cards (credit-card-specific fields/display)

## Implementation Steps

- [ ] Resolve field/behavior decisions in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
