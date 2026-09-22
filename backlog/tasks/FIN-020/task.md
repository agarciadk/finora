---
id: FIN-020
type: refactor
status: refinement
priority: low
epic:
labels: []
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-020 — Add global state management with Zustand

## Summary

The inbox asks to add global app state using Zustand ("Añadir estado global a la App con Zustand"). No specific state slice/problem to solve is named — the frontend currently relies on React context (`AuthProvider`) and per-page hooks/local state.

## User Story

As a developer working on the frontend,
I want a clear place for cross-page shared state,
so that state doesn't need to be threaded through props or duplicated context providers.

## Acceptance Criteria

- [ ] ...to be defined once the specific state that needs to become global is identified.

## Definition of Ready

- [ ] The objective is clearly defined.
- [ ] The scope is understood.
- [ ] Acceptance criteria are testable.
- [ ] Major functional questions are resolved.
- [ ] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
