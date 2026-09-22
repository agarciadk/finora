# Implementation

## Approach

Likely a new method/endpoint on the existing `AnalyticsService` (`apps/api/src/analytics`), following the same pattern as `evolution`/`vital-margin` (excluding `isTransfer` transactions). Exact grouping/window needs to be resolved first.

## Files / Areas Affected

- `apps/api/src/analytics/`
- `apps/web/src/hooks/use-analytics.ts` (or equivalent) and relevant analytics UI components.

## Implementation Steps

- [ ] Resolve averaging window/grouping in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
