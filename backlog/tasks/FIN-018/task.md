---
id: FIN-018
type: feature
status: ready
priority: medium
epic:
labels: []
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-018 — Custom colors for categories

## Summary

Let users assign a color to each category, and use that color consistently everywhere a category is shown (transaction lists, budgets, analytics charts, category management page).

## User Story

As a user,
I want to pick a color for each category,
so that I can visually recognize categories consistently across the app.

## Acceptance Criteria

- [ ] A category can have an optional color (e.g. hex value) set/edited from the category management page.
- [ ] The category's color is shown consistently wherever categories appear: transaction rows/badges, category list, budget cards, `AnalyticsCategoryChart` (currently uses its own palette per `.ai-context/03-ui-ux.md`).
- [ ] Categories without an explicitly-set color fall back to the current default behavior (e.g. existing chart palette / neutral badge).
- [ ] Existing categories are unaffected until a color is explicitly set.

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
