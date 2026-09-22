# Implementation

## Approach

Likely: extend the import preview step (before committing) to run a duplicate check against existing transactions for the target account/date range, and flag matches in the review UI with a per-row checkbox. Needs the exact matching rule from `specification.md` resolved first.

## Files / Areas Affected

- `apps/api/src/import/` (duplicate-check query).
- `apps/web/src/components/` import dialog (per `.ai-context/05-current-epic.md`, note the existing broken test in `import-transactions-dialog.test.tsx` — check whether it's still broken before changing this file).

## Implementation Steps

- [ ] Resolve the duplicate-matching rule in `specification.md` first.
- [ ] Check current state of the known broken test in `import-transactions-dialog.test.tsx`.

## Testing

- [ ] Backend test for the duplicate-detection query/rule once defined.
- [ ] Frontend test for the review UI's include/exclude toggle.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
