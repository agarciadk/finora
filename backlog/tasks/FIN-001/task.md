---
id: FIN-001
type: documentation
status: ready
priority: low
epic:
labels: []
depends_on: []
related_to: [FIN-002]
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-001 — Improve the root README

## Summary

The root `README.md` is out of date relative to the current monorepo (backlog system, `.ai-context/`, current app structure). Review and update it so a new contributor (human or agent) gets an accurate picture of the project, how to run it, and where to find further documentation.

## User Story

As a new contributor,
I want the README to accurately describe the project and how to get it running,
so that I don't have to reverse-engineer setup steps from `package.json`/CI files.

## Acceptance Criteria

- [ ] README reflects the actual monorepo layout (`apps/api`, `apps/web`, `backlog/`, `.ai-context/`).
- [ ] Setup/run instructions (install, dev servers, tests) match what's actually in `package.json`/CI workflows today.
- [ ] README links to `.ai-context/` and `backlog/README.md` instead of duplicating their content.
- [ ] No stale references to removed pages/features (cross-check against `.ai-context/05-current-epic.md` history).

## Definition of Ready

- [x] The objective is clearly defined.
- [x] The scope is understood.
- [x] Acceptance criteria are testable.
- [x] Major functional questions are resolved.
- [x] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
