# Specification

## Context

Account cards currently show name/bank/type/balance in the accounts list (Wealth tab, per `.ai-context/05-current-epic.md`'s Tabs Migration). No per-account or per-type color coding exists.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Color source: a fixed palette per `AccountType` (checking/savings/credit card/cash each get a distinct color), a user-chosen color per account (similar to FIN-018's category colors — could reuse the same picker pattern), or something else?
  - Should this wait for/reuse the broader palette decision from FIN-036, to avoid picking colors that clash with a subsequent global redesign?

## Out of Scope

- The broader site-wide palette/typography change — see FIN-036.
