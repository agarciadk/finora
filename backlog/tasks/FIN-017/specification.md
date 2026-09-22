# Specification

## Context

`AnalyticsService` already computes income/expense evolution and category breakdowns per month (`.ai-context/05-current-epic.md`, "Time Machine Analytics" epic, `GET /analytics/evolution`). This idea builds on that existing transaction history to surface an "average" figure — it's an extension of Analytics, not a new data source.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Average of what, over what window? (e.g. average monthly spend per category over the last N months — N is undefined.)
  - Is this a new analytics endpoint/widget, or does it feed into another feature (e.g. as an input to budget suggestions, or the "Margen Vital" KPI)? The inbox doesn't say.
  - Should transfers (`Transaction.isTransfer`) be excluded, consistent with how `AnalyticsService` already excludes them from income/expense queries (per `.ai-context/05-current-epic.md`)?

## Out of Scope

- Any predictive/forecasting logic beyond a historical average, unless later requested.
