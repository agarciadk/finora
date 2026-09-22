# Specification

## Context

`Category` (`apps/api/prisma/schema.prisma`) currently has no color field; every place that shows a category color today (e.g. `AnalyticsCategoryChart`'s pie chart, per `.ai-context/03-ui-ux.md`) must be assigning colors from an internal palette rather than a per-category value.

## Functional Requirements

- Add an optional `color` field to `Category` (e.g. a hex string, validated at the DTO level).
- Category create/edit form (Sheet pattern, per `.ai-context/03-ui-ux.md`) gets a color picker/swatch input.
- Every UI surface that currently renders a category (transaction category badges/select, budget cards, category management list, `AnalyticsCategoryChart`) reads this color when present.

## Data Changes

- Prisma migration: add `Category.color String?`.

## API Changes

- `CreateCategoryDto`/`UpdateCategoryDto` gain an optional `color` field (validated, e.g. `@IsHexColor()` or a fixed palette allowlist — pick whichever keeps validation simple).

## Edge Cases

- No color set → fall back to the existing default palette logic, don't break `AnalyticsCategoryChart`'s current empty-state/fallback behavior.
- Duplicate colors across categories are allowed (not a uniqueness constraint).

## Out of Scope

- A dedicated color-picker UI library — reuse whatever's simplest with existing `Select`/`Input` primitives (e.g. a fixed swatch palette) unless a full picker is clearly warranted.
