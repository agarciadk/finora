---
description: "Use when the user asks to implement the next backlog task (e.g. \"Ponte con la siguiente tarea\", \"Implementa la siguiente tarea\", \"Siguiente tarea\", \"Continúa con el backlog\"), or otherwise asks to implement a specific FIN-XXX task end to end. Covers the autonomous task-selection, implementation, validation and reporting workflow."
---

# Autonomous task implementation workflow

## Trigger

When the user says something equivalent to "Ponte con la siguiente tarea", "Implementa la siguiente tarea", "Siguiente tarea", "Continúa con el backlog", or any other phrasing (Spanish, English, or otherwise) that clearly means "implement the next backlog task", run the workflow below immediately, without asking the user to repeat or paste it again. The exact wording never needs to match literally — interpret intent consistently.

This trigger means **implement**, never **refine**. Never treat it as a request to work through `backlog/inbox.md` or move a task from `refinement`/`inbox` to `ready` — that is the separate refinement workflow (see [`backlog.instructions.md`](./backlog.instructions.md)) and only runs when explicitly requested.

## Workflow

1. **Read context**: `.ai-context/`, `backlog/README.md`, and the `status`, `priority`, `depends_on`, and `created_at` fields from each task.md frontmatter across `backlog/tasks/*/` to find the `ready` tasks. Don't read a task's `specification.md`/`implementation.md` unless it's a serious candidate.
2. **Select the task** following the selection rules in [`backlog.instructions.md`](./backlog.instructions.md) (readiness, dependency safety, tie-break order). Report the selected FIN ID and title before touching anything else.
   - If no task qualifies, stop here: report that there is no eligible implementation task and why (e.g. all `ready` tasks are blocked, or none has `status: ready`). Do not fall back to implementing a `refinement`/`inbox` item, and do not start refining anything unless separately asked.
3. **Prepare Git** exactly as described in [`git.instructions.md`](./git.instructions.md) (clean tree check, fetch, fast-forward `main`, create/reuse the branch, switch). Never implement on `main`.
4. **Read the task**: `task.md`, `specification.md`, `implementation.md`, the relevant application code, and `.ai-context/` for project-level technical context. Do not invent missing product requirements. If a significant product/architectural decision is unresolved, don't guess — leave the task in `refinement`, document the blocker in `implementation.md`, and report it instead of implementing. Set `status: in_progress` and update `updated_at` in `task.md` before starting.
5. **Resolve `depends_on`** if not all are `done`:
   1. Assess whether the incomplete work affects the files, APIs, or data structures this task touches.
   2. If it's safe to proceed, note explicitly why the incomplete dependency doesn't affect this task before continuing.
   3. If it's not safe (or a dependency issue is discovered mid-implementation), pause, document the blocker in `implementation.md`, and set `status` back to `refinement` (or note it as blocked).
6. **Implement** only the selected task's scope (`task.md` + `specification.md`'s "Out of Scope"), following existing architecture, coding conventions, established patterns, testing strategy, accessibility and security requirements. Don't opportunistically implement other backlog items — log anything else you notice in `backlog/inbox.md` instead. Keep `implementation.md` current as you go (approach, files affected, step checklist, decisions).
7. **Validate** using the project's existing scripts (type checks, lint, unit/integration/E2E/accessibility tests, build) for the areas touched — see root README.md and [`testing.instructions.md`](./testing.instructions.md). Don't skip a validation step silently; if one is skipped, document why. If no validation script exists for a touched area, document this explicitly in `implementation.md` rather than skipping silently. Fix failures caused by this implementation before continuing; do not mark the task complete with unresolved failures.
8. **Update the backlog**: task status, `implementation.md` (approach, files affected, decisions, validation results), while preserving the original `specification.md`. Only set `status: done` once the Definition of Done is actually satisfied; otherwise leave it in the correct status (`in_progress`, `review`, or back to `refinement`) and document why. If `task.md` has no Definition of Done, or it's ambiguous, do not mark the task `done` — leave it in `refinement` and note the missing/ambiguous criteria in `implementation.md`.
9. **Review the diff** before committing: `git status`, review the full diff, confirm only files belonging to this FIN task are included, and that no generated or temporary files slipped in.
10. **Commit** following the conventions in [`git.instructions.md`](./git.instructions.md). One commit per task unless the repository's conventions require more.
11. **Do not merge** the branch into `main`, and do not push unless explicitly instructed.
12. **Final report**, always structured as:
    - **Task**: FIN ID, title, final status
    - **Git**: branch, base branch, commit hash, commit message
    - **Implementation**: concise summary
    - **Validation**: commands/tests run and their results
    - **Remaining work**: blockers or follow-ups, if any

## Never

The agent must never: work directly on `main`; discard, reset, or stash unrelated uncommitted user changes; invent unresolved product requirements; implement unrelated tasks; merge automatically; silently skip failing validation; or mark a task `done` when it isn't actually complete.
