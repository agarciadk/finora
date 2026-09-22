# Implementation

## Approach

Cannot be finalized yet — depends on the rule-matching model decided in `specification.md`. Likely a new Prisma model (e.g. `CategorizationRule`) plus a service that runs matching rules against newly-created/imported transactions.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (new model, migration).
- `apps/api/src/categories/` and/or `apps/api/src/transactions/`.
- `apps/api/src/import/` if rules should also apply on import.

## Implementation Steps

- [ ] Resolve rule-matching model and creation flow in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
