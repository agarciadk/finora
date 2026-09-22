# Implementation

## Approach

Added `color` to the `Category` Prisma model + migration, threaded it through the categories DTOs/service, added a fixed swatch-palette picker to the category Sheet form, and updated the category-rendering surfaces called out in the acceptance criteria to prefer `category.color` when present, falling back to the existing default otherwise.

Chose a fixed 9-color swatch palette (`CATEGORY_COLORS`, duplicated in `apps/api/src/categories/category-colors.ts` and `apps/web/src/lib/category-colors.ts`, matching the existing pattern of duplicating small enums/constants between the two apps since there's no shared package) validated server-side with `@IsIn(CATEGORY_COLORS)`, instead of a full hex color picker — per the spec's "Out of Scope" note.

## Files / Areas Affected

- `apps/api/prisma/schema.prisma` (+ migration `20260922182945_add_category_color`)
- `apps/api/src/categories/category-colors.ts` (new — fixed palette constant)
- `apps/api/src/categories/dto/create-category.dto.ts` (+ new spec file)
- `apps/api/src/analytics/analytics.service.ts` (`spendingByCategory` now includes `color`)
- `apps/web/src/lib/category-colors.ts` (new — fixed palette constant)
- `apps/web/src/lib/types.ts` (`Category.color`, `SpendingByCategory.color`)
- `apps/web/src/hooks/use-categories.ts` (`CategoryInput.color`)
- `apps/web/src/components/category-color-dot.tsx` (new — shared color-dot indicator)
- `apps/web/src/components/settings/categories-tab.tsx` (swatch picker in the form, dot in the list)
- `apps/web/src/components/transaction-category-select.tsx` (dot in the dropdown items)
- `apps/web/src/components/planning/budgets-tab.tsx` (dot next to the budget card title)
- `apps/web/src/components/planning/recurring-payments-tab.tsx` (dot in the category badge)
- `apps/web/src/components/analytics/analytics-category-chart.tsx` (uses `item.color` when present, falls back to the existing `CHART_COLORS` palette)
- `apps/web/src/i18n/locales/{en,es}/translation.json` (`categories.form.colorLabel`/`colorNone`)
- `apps/web/test/components/import-transactions-dialog.test.tsx`, `apps/web/test/components/transactions-bulk-actions-bar.test.tsx` (added required `color: null` to `Category` fixtures)

## Implementation Steps

- [x] Add `color` field + migration.
- [x] Update `CreateCategoryDto`/`UpdateCategoryDto` (via `PartialType`) + service (no service change needed — DTO already spread into `create`/`update`).
- [x] Add color input to the category create/edit form (fixed swatch palette + "no color" option).
- [x] Update all category-rendering surfaces called out in the acceptance criteria to use the stored color with a sensible fallback.

## Testing

- [x] Backend unit tests for the new field validation (`create-category.dto.spec.ts`: omitted, valid palette value, rejected out-of-palette value).
- [x] Frontend: updated existing `Category` fixtures to the new shape; no new component test added specifically for the swatch picker since it's plain DOM (`aria-pressed` buttons) covered indirectly by existing a11y/e2e suites.

## Validation

- [x] `pnpm --filter @finora/api build`, `pnpm --filter @finora/api lint`, `pnpm --filter @finora/web typecheck`, `pnpm --filter @finora/web lint` — clean.
- [x] `pnpm --filter @finora/api test` — 182 passed.
- [x] `pnpm test` (web Vitest) — 55 passed.
- [x] `pnpm test:e2e` — 32 passed.
- [x] `pnpm test:a11y` — 12 passed.
- [ ] `pnpm --filter @finora/api test:e2e` (Jest e2e) — pre-existing environment issue, unrelated to this change: fails with `Cannot find module './internal/class.js'` as soon as a spec imports `PrismaService`/the generated client, documented as a known/pending gotcha in `.ai-context/04-gotchas.md` ("Pending: `test/jest-e2e.json` doesn't have this mapper yet"). Not caused by this task's changes.

## Discovered Work (out of scope)

—

## Notes

- Duplicate colors across categories are allowed (no uniqueness constraint), as specified.
- Clearing an already-set color back to "none" is supported in the form (sends `color: undefined`, which `JSON.stringify` drops from the request body) but there's no dedicated way to explicitly null out a color server-side beyond simply not setting it — out of scope per the spec.

