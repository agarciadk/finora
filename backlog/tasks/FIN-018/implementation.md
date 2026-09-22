# Implementation

## Approach

Add `color` to the `Category` Prisma model + migration, thread it through the categories DTOs/service, add a color input to the category Sheet form, and update every category-rendering surface to prefer `category.color` when present.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (+ migration)
- `apps/api/src/categories/` (DTOs, service)
- `apps/web/src/components/` category form/Sheet, category badges/select, budget cards
- `apps/web/src/components/analytics/analytics-category-chart.tsx` (or equivalent, per `.ai-context/03-ui-ux.md`)

## Implementation Steps

- [ ] Add `color` field + migration.
- [ ] Update `CreateCategoryDto`/`UpdateCategoryDto` + service.
- [ ] Add color input to the category create/edit form.
- [ ] Update all category-rendering surfaces to use the stored color with a sensible fallback.

## Testing

- [ ] Backend unit tests for the new field validation.
- [ ] Frontend tests for the color input and for at least one rendering surface using the stored color.

## Validation

- [ ] `tsc`/`eslint` clean on both apps.
- [ ] Relevant Vitest/Jest suites green.

## Discovered Work (out of scope)

—

## Notes

—
