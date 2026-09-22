# Specification

## Context

The accounts list already has a full create/edit Sheet form (per the general Sheet+AlertDialog pattern in `.ai-context/03-ui-ux.md`). The account detail page was added later (Epic "Interest-Bearing Accounts & Detail View") primarily to show stats, and apparently doesn't reuse that same edit form.

## Functional Requirements

- Reuse the existing account edit Sheet/form component from the accounts list on the detail page (open it from an "Edit" action on the detail view), rather than building a second, parallel edit form.
- All fields present in the list's edit form (including newer ones like `iban`, `interestRate`/`taxRate`/`interestPaymentDay`) must be editable from the detail page too.

## Edge Cases

- After a successful edit, the detail page's displayed stats/fields must reflect the update immediately (re-fetch or update local state, consistent with existing patterns).

## Out of Scope

- Any new fields not already editable from the accounts list.
