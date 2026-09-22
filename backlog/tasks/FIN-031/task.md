---
id: FIN-031
type: technical
status: ready
priority: medium
epic: developer-experience-code-quality
labels: [observability]
depends_on: []
related_to: []
created_at: 2026-09-22
updated_at: 2026-09-22
---

# FIN-031 — HTTP request logging in the backend

## Summary

Add structured HTTP request logging to `apps/api` (method, path, status code, duration, and, where available, `userId`), so requests are traceable in production without relying only on ad-hoc `Logger.log` calls scattered across services.

## User Story

As a maintainer,
I want every API request logged with basic metadata,
so that I can debug production issues and understand traffic patterns.

## Acceptance Criteria

- [ ] Every incoming HTTP request is logged with at least: method, path, status code, response time.
- [ ] Logging does not log sensitive data (passwords, tokens, full request bodies for auth endpoints) — consistent with the existing sanitization/security posture in `.ai-context/02-auth-security.md`.
- [ ] Logging is implemented as a single cross-cutting piece (interceptor or middleware), not duplicated per-controller.
- [ ] Works consistently with the existing `ThrottlerModule`/`helmet()` global setup without conflicting.

## Definition of Ready

- [x] The objective is clearly defined.
- [x] The scope is understood.
- [x] Acceptance criteria are testable.
- [x] Major functional questions are resolved.
- [x] The task contains enough context to begin implementation.

## Definition of Done

- [ ] The implementation is complete.
- [ ] Acceptance criteria are satisfied.
- [ ] Relevant tests have been added or updated.
- [ ] Relevant validation has been performed.
- [ ] Documentation has been updated when necessary.
- [ ] No known task-specific issues remain.
