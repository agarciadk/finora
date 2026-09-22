# Implementation

## Approach

Add a Semgrep step (via `pnpm dlx semgrep` or a pinned local dependency) to the existing Husky pre-commit script, scoped to staged files, using a standard registry ruleset.

## Files / Areas Affected

- `.husky/pre-commit` (or equivalent existing hook script).
- Root `package.json` (new dev dependency/script if Semgrep is installed locally rather than invoked via `pnpm dlx`).

## Implementation Steps

- [ ] Add a Semgrep scan step to the pre-commit hook, scoped to staged files.
- [ ] Select a standard ruleset (e.g. `p/security-audit`) rather than authoring custom rules.
- [ ] Measure the added runtime and confirm it stays reasonable.

## Testing

- [ ] N/A (tooling change) — validated by running the hook locally with a deliberately-flagged pattern to confirm it blocks the commit.

## Validation

- [ ] Run a full local commit through the hook to confirm it still passes on clean code and blocks on an intentionally-introduced issue.

## Discovered Work (out of scope)

—

## Notes

—
