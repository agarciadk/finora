# Implementation

## Approach

Likely mostly infrastructure (domain purchase/verification, `RESEND_API_KEY` + sender domain configured in Render env vars) rather than application code, given `MailService`/Resend integration already exists. Needs confirmation once the open questions in `specification.md` are resolved.

## Files / Areas Affected

- Deployment/env configuration (Render), not necessarily application code.
- `apps/api/src/mail/` only if the provider or sending logic itself needs to change.

## Implementation Steps

- [ ] Resolve domain/provider decision in `specification.md` first.

## Testing

- [ ] N/A (infra), unless code changes are needed.

## Validation

- [ ] Send a real test email through the new domain/account once configured.

## Discovered Work (out of scope)

—

## Notes

—
