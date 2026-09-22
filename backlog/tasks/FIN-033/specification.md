# Specification

## Context

The pre-commit hook (Husky) already runs a full lint+vitest+e2e+a11y suite and requires a real Postgres via `docker compose up -d postgres` (`.ai-context/04-gotchas.md`). Adding Semgrep is additive to this hook.

## Functional Requirements

- Run Semgrep against staged/changed files only (to keep the hook fast), using an established ruleset (e.g. `p/security-audit`, `p/owasp-top-ten` from the Semgrep registry) rather than a custom one.
- Block the commit on findings above an agreed severity.

## Non-Functional Requirements

- Must not meaningfully worsen the already-long pre-commit runtime; scanning only changed files (not the whole repo) is the key mitigation.

## Out of Scope

- A full-repo Semgrep baseline/triage pass — that's a one-time follow-up once the hook is in place, not part of standing up the integration.
