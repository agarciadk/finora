# Implementation

## Approach

Likely `@nestjs/passport` + `passport-google-oauth20` (and an Apple strategy) integrated alongside the existing `AuthModule`, reusing the current JWT+refresh-cookie issuance once the OAuth handshake completes. Needs the account-linking/email-verification decisions in `specification.md` resolved first.

## Files / Areas Affected

- `apps/api/src/auth/` (new strategies/controllers).
- `apps/web/src/pages/login-page.tsx` / `register-page.tsx` (new provider buttons).

## Implementation Steps

- [ ] Resolve provider scope and account-linking rules in `specification.md` first.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

—
