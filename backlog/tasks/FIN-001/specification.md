# Specification

## Context

The README predates the backlog system and several completed epics (see `.ai-context/05-current-epic.md`). It's the first thing a human or external tool sees on the repo.

## Functional Requirements

- Accurately describe what Finora is, the monorepo structure, and how to run `apps/api`/`apps/web` locally (including `compose.yml` for Postgres).
- Link out to `.ai-context/` (project knowledge) and `backlog/README.md` (how work is tracked) rather than duplicating them.
- List the actually-available scripts (lint/test/build) per app, matching `package.json`.

## Out of Scope

- Rewriting `.ai-context/` or `backlog/README.md` content — this task only touches the root `README.md`.
- Marketing copy / screenshots — purely a documentation-accuracy pass.
