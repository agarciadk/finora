# Implementation

## Approach

Add GitHub's standard CodeQL Analysis workflow (`github/codeql-action`) for the `javascript-typescript` language, following the same Actions conventions as the existing workflows (`pnpm/action-setup@v4`, `actions/setup-node@v4` node 22) if a build step is needed before analysis.

## Files / Areas Affected

- New `.github/workflows/codeql.yml`.

## Implementation Steps

- [ ] Add the CodeQL workflow file for `javascript-typescript`.
- [ ] Confirm it runs on push/PR to `main` plus a schedule.

## Testing

- [ ] N/A (CI config change).

## Validation

- [ ] Push a branch/PR and confirm the CodeQL workflow runs successfully and reports to the Security tab.

## Discovered Work (out of scope)

—

## Notes

If GitHub's "default setup" (Settings → Code security) is preferred over an in-repo workflow file, that toggle requires repo admin access and can't be done by an agent — document this as a manual step either way.
