# Implementation

## Approach

Add a `sonar-project.properties` at the repo root (multi-module: `apps/api`, `apps/web`), and a new GitHub Actions job using `SonarSource/sonarcloud-github-action`, run after the existing test steps so coverage is available.

## Files / Areas Affected

- `.github/workflows/ci.yml` (new job) or a new `.github/workflows/sonarcloud.yml`.
- New `sonar-project.properties` at the repo root.

## Implementation Steps

- [ ] Add `sonar-project.properties` covering both apps.
- [ ] Add the SonarCloud scan step/job to CI, running after tests (for coverage).
- [ ] Document the required `SONAR_TOKEN`/project setup as a manual step (external SonarCloud account/project creation is outside agent capability).

## Testing

- [ ] N/A (CI config change) — validated by a successful workflow run.

## Validation

- [ ] Push a branch/PR and confirm the workflow runs and (once secrets are configured) reports to SonarCloud.

## Discovered Work (out of scope)

—

## Notes

Requires a human to create the SonarCloud project and add `SONAR_TOKEN` as a repo secret before the workflow can succeed end-to-end — the workflow file itself can be added and validated for syntax without it.
