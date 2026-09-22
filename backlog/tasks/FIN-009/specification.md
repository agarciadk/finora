# Specification

## Context

`Account.iban` is stored in full in the database and returned as-is by the API; masking (`ES91 •••• •••• •••• 1332`) currently happens in `apps/web` (`formatIban`, per `.ai-context/05-current-edic.md`/`01-architecture.md`). Masking client-side means the full value is always present in the API response and browser memory/devtools, even though the UI never needs to show it unmasked outside of an edit form.

## Functional Requirements

- The `GET` endpoints that return account data for display-only contexts (e.g. account list/detail read models) should return a masked IBAN, not the raw value.
- The edit flow (account form) still needs the real value to let the user correct a mistyped IBAN — needs to decide whether the edit form re-fetches/receives the unmasked value via a distinct, more restricted path, or whether editing IBAN always requires re-entering it in full (simplest option, avoids ever sending the unmasked value to a "display" context).

## Security

- This directly reduces sensitive-data exposure to the frontend, in line with defense-in-depth (OWASP: minimize data exposure to the client).
- Do not sanitize/transform the field in a way that breaks validation (`@IsIBAN()` per `.ai-context/01-architecture.md`) on write.

## Edge Cases

- Accounts without an `iban` set (field is optional) must not error when masking — return `null`/`undefined` unchanged.

## Out of Scope

- Masking of any other field beyond IBAN, unless the same pattern is found elsewhere during implementation (if so, note it in `implementation.md` rather than expanding scope silently).
