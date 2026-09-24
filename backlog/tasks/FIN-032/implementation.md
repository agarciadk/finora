# Implementation

## Approach

Added `sonar-project.properties` at the repo root and a new `.github/workflows/sonarcloud.yml` job using `SonarSource/sonarcloud-github-action@v3`, running after both apps' test suites (with coverage) so lcov reports are available. `SONAR_ORGANIZATION`/`SONAR_PROJECT_KEY` are passed as GitHub Actions repository variables (`vars.*`) rather than hardcoded, since the actual SonarCloud project doesn't exist yet and must be created manually.

## Files / Areas Affected

- `.github/workflows/sonarcloud.yml` (new): installs deps, runs `pnpm --filter @finora/api test:cov` and `pnpm --filter @finora/test test:cov`, normalizes lcov `SF:` paths to be repo-root-relative (each app's coverage tool reports paths relative to its own package root, not the monorepo root), then runs the SonarCloud scan.
- `sonar-project.properties` (new): `sonar.sources`/`sonar.tests` covering `apps/api/src` and `apps/web/src`/`apps/web/test`, lcov report paths for both apps, excludes `apps/api/src/generated/**` and `apps/web/src/components/ui/**` (shadcn-generated).
- `apps/web/test/vitest.config.ts`: added `coverage` config (`provider: v8`, `lcov` reporter). Had to set `root` to `apps/web` (previously implicit as `apps/web/test`, the config file's own directory) — with `root` scoped to the test package alone, the v8/istanbul coverage providers silently produced `0/0` reports because none of the actually-executed `apps/web/src/**` files (imported via the `@` alias) were considered "in-root", regardless of `coverage.include` patterns (absolute globs included). Moving `root` one level up (so `src` and `test` are both under it) fixed this; `test.include`/`setupFiles` were adjusted accordingly to still resolve correctly.
- `apps/web/test/package.json`: added `test:cov` script and `@vitest/coverage-v8` devDependency (pinned to the exact installed `vitest` version, `^4.1.11`, since coverage providers must match).
- `.gitignore`: added `apps/api/coverage`/`apps/web/test/coverage` (the existing `/coverage` entry is root-anchored and didn't cover these nested paths).
- `README.md`: documented `sonarcloud.yml` in the CI/CD table plus the one-time manual setup (create the SonarCloud project, set `SONAR_TOKEN` secret and `SONAR_ORGANIZATION`/`SONAR_PROJECT_KEY` repo variables).
- `pnpm-lock.yaml`: updated for the new devDependency.

## Implementation Steps

- [x] Add `sonar-project.properties` covering both apps.
- [x] Add the SonarCloud scan step/job to CI, running after tests (for coverage).
- [x] Document the required `SONAR_TOKEN`/project setup as a manual step (external SonarCloud account/project creation is outside agent capability).

## Testing

N/A — CI/tooling config change, no application code touched. `apps/api`'s existing Jest coverage (`test:cov`, already configured) and the new web Vitest coverage were both run locally to validate wiring (see Validation).

## Validation

- `pnpm lint` — passes (both apps).
- `pnpm typecheck` — passes.
- `pnpm test` — 60/60 web unit tests pass (unaffected by the `root` change).
- `pnpm --filter @finora/api test:cov` — 192/192 tests pass, `apps/api/coverage/lcov.info` generated with real per-file coverage.
- `pnpm --filter @finora/test test:cov` — 60/60 tests pass, `apps/web/test/coverage/lcov.info` generated with real per-file coverage (69% statements) after the `root` fix above.
- `.github/workflows/sonarcloud.yml` parsed with `python3 -c "import yaml; yaml.safe_load(...)"` — valid YAML.
- Not validated end-to-end (no live SonarCloud project/token exists yet): the actual scan step, PR decoration, and whether the lcov path normalization (`sed` prefixing `SF:` lines with `apps/api/`/`apps/web/`) matches SonarCloud's path-resolution exactly. This can only be confirmed once a human provisions the SonarCloud project and secrets and a real PR triggers the workflow.

## Discovered Work (out of scope)

—

## Notes

- Per the task's own framing (and the epic's notes), the SonarCloud account/project creation and secret provisioning cannot be done by an agent — documented in `README.md`'s CI/CD section as the remaining manual step before the workflow can succeed end-to-end.

