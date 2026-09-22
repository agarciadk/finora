# Specification

## Context

`.github/workflows/ci.yml` already runs lint/typecheck/test/build on push+PR to `main` (`.ai-context/01-architecture.md`). SonarCloud integration is additive to this pipeline, not a replacement.

## Functional Requirements

- A `sonarcloud.yml` (or extension of `ci.yml`) workflow runs `sonar-scanner`/the official SonarSource GitHub Action after tests (so coverage reports are available to feed in).
- Coverage reports from both apps' test runners are generated in a Sonar-compatible format and referenced in `sonar-project.properties`.

## Security

- `SONAR_TOKEN` must be stored as a GitHub Actions secret, never committed.

## Out of Scope

- Fixing any code-quality issues Sonar surfaces after the first scan — that's follow-up work, not part of standing up the integration.
