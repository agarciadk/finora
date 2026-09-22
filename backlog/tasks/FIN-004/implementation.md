# Implementation

## Approach

Cannot be finalized yet — depends on the opening-balance-vs-full-replacement decision in `specification.md`. Likely areas either way: `apps/api/src/accounts/accounts.service.ts` (balance read/update paths) and `apps/api/src/transactions` (write paths that currently don't touch `Account.balance` directly, if any).

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (possibly: rename/repurpose `balance`, or add an `openingBalance` field — needs a migration either way).
- `apps/api/src/accounts/`
- `apps/api/src/transactions/`

## Implementation Steps

- [ ] Resolve the open questions in `specification.md` first.

## Testing

- [ ] Unit tests for whatever balance-computation service method is introduced.
- [ ] Regression test: soft-deleted/reassigned transactions must not affect the computed balance.

## Validation

- [ ] Manual check against `apps/api/src/accounts/accounts.service.spec.ts` existing test patterns.

## Discovered Work (out of scope)

—

## Notes

Kept in `refinement` on purpose: this directly contradicts a documented, intentional design decision in `.ai-context/01-architecture.md`. Implementing it without resolving the open questions above would silently change core financial-correctness behavior.
