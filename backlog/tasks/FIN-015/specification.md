# Specification

## Context

`apps/api/src/import` already handles `.xls`/`.xlsx` import (per `.ai-context/04-gotchas.md`, SheetJS pinned to the sheetjs.com tarball). There's a known related test issue: `apps/web/test/components/import-transactions-dialog.test.tsx` "had a pre-existing, unrelated broken test" per `.ai-context/05-current-epic.md` — worth checking before/while touching this area.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What defines a "duplicate"? Candidate rule: same account + date + amount (+ description similarity)? Exact rule is not specified anywhere.
  - UI flow: does the import dialog show a review step listing flagged rows with a per-row include/exclude toggle before committing the import?
  - Should this reuse/relate to FIN-016 (auto-categorization rules), since both operate on pattern-matching imported/repeated transactions? Related, but distinct: this is about duplicate detection, FIN-016 is about category assignment.

## Edge Cases

- Legitimate repeated transactions (e.g. two identical coffee purchases on the same day) must not be silently dropped — the user must be able to opt back in per-row.

## Out of Scope

- Auto-categorization of imported transactions — see FIN-016.
