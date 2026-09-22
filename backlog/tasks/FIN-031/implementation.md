# Implementation

## Approach

Add a global Nest interceptor (or `main.ts`-level middleware) that logs method/path/status/duration via the built-in `Logger`, registered similarly to how `AuditLogInterceptor` is registered as an `APP_INTERCEPTOR` inside its own module (`.ai-context/02-auth-security.md`).

## Files / Areas Affected

- `apps/api/src/common/` (new interceptor, following the existing module layout conventions).
- `apps/api/src/app.module.ts` (registration, if global).

## Implementation Steps

- [ ] Add a request-logging interceptor/middleware.
- [ ] Ensure it excludes sensitive routes/fields per the Security section.
- [ ] Register it globally.

## Testing

- [ ] Unit test for the interceptor (asserts a log call with expected fields, no sensitive data).

## Validation

- [ ] `tsc`/`eslint` clean.
- [ ] Manual check: hit a couple of endpoints locally and confirm log output.

## Discovered Work (out of scope)

—

## Notes

—
