# Specification

## Context

Net-salary calculation depends on a specific country's tax brackets and social security contribution rules (the app's UI strings are in Spanish, suggesting Spain, but this is inferred, not confirmed anywhere in `.ai-context/`). Getting this wrong would give users incorrect financial numbers, so the rule source must be explicit and correct, not guessed.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Which country/jurisdiction's tax rules apply (assumed Spain based on UI language, needs confirmation)?
  - Which year's tax brackets/thresholds (these change annually) — and how are they kept up to date over time (hardcoded constants vs. a maintained table)?
  - Scope: personal income tax (IRPF) only, or also social security contributions, regional variations, etc.?

## Out of Scope

- Any jurisdiction beyond the one confirmed, until requested.
