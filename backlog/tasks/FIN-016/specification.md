# Specification

## Context

`Transaction.categoryId` is not nullable (`.ai-context/01-architecture.md`) — every transaction already requires a category today, presumably chosen manually or defaulted during import. This task would add a rules engine that pre-fills/auto-assigns that category based on matching past behavior.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What can a rule match on? Candidate fields: description/merchant text (contains/exact), amount range, account. None confirmed.
  - Are rules created explicitly by the user (a "Rules" management UI), or inferred implicitly (e.g. "you always categorize X as Y, apply this going forward?")? The inbox wording ("el usuario mediante reglas pueda asignar") suggests explicit user-authored rules, but the UI/creation flow isn't defined.
  - Do rules apply only to new transactions going forward, or can they be retroactively applied to existing uncategorized-by-rule transactions?
  - Interaction with import (FIN-015): should rules also apply during file import, so imported rows get pre-categorized?

## Out of Scope

- Duplicate detection during import — see FIN-015 (related but distinct).
