# Specification

## Context

`apps/api` uses Nest's built-in `Logger` ad hoc (e.g. `MailService` logs verification links when `RESEND_API_KEY` is unset, per `.ai-context/02-auth-security.md`) but has no dedicated, cross-cutting HTTP request logging today.

## Functional Requirements

- A global interceptor or middleware logs every request/response pair: method, URL/path, status code, duration in ms.
- Where `request.user` is populated (post-`JwtAuthGuard`), include `userId` in the log line for traceability, mirroring how `AuditLogInterceptor` already derives `userId` from the request (`.ai-context/02-auth-security.md`).

## Security

- Never log request/response bodies for `auth/*` routes (passwords, tokens) or `Set-Cookie`/`Cookie` headers.
- Consistent with the existing `@SanitizeHtml()` philosophy of only touching what's safe — log metadata, not raw payloads, by default.

## Non-Functional Requirements

- Should not meaningfully add latency to every request (a lightweight interceptor, not a synchronous external call).

## Out of Scope

- Shipping logs to an external aggregator (e.g. Datadog/ELK) — out of scope unless requested; this task is about generating structured logs, not centralizing them.
