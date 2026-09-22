# Implementation

## Approach

Cannot be finalized yet — depends on the opt-in-flag and auto-transaction-creation decisions in `specification.md`. If a scheduled job is required, this would be a new piece of infrastructure for `apps/api` (no existing cron/scheduler is documented in `.ai-context/`).

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (possible new field), `apps/api/src/recurring-payments/`.

## Implementation Steps

- [ ] Resolve the open questions in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
