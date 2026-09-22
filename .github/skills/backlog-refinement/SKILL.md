---
name: backlog-refinement
description: 'Use when the user asks to refine the Finora backlog, e.g. "Haz el refinamiento", "Refina el backlog", "Haz un refinamiento del backlog", "Refina las ideas pendientes", or asks to refine one specific inbox idea. Executes the end-to-end refinement workflow: turns pending backlog/inbox.md ideas into FIN-XXX tasks (or refines a single named idea), following .github/instructions/backlog.instructions.md. Never implements code, creates branches, or commits — that is a separate workflow.'
---

# Backlog Refinement

Executable process for turning `backlog/inbox.md` ideas into formal `FIN-XXX` tasks. The permanent rules this process follows live in [`backlog.instructions.md`](../../instructions/backlog.instructions.md) — this Skill does not redefine them, only sequences them. If anything here ever appears to conflict with `backlog.instructions.md`, that file wins.

## Triggers

- **Full refinement**: "Haz el refinamiento", "Refina el backlog", "Haz un refinamiento del backlog", "Refina las ideas pendientes", or an equivalent phrasing (any language) with the same intent → process every pending idea in `backlog/inbox.md`.
- **Targeted refinement**: the user names or points at one specific inbox idea → process only that idea, unless they ask for more.
- **Not this Skill**: "Ponte con la siguiente tarea" / "implementa la siguiente tarea" and similar phrasing select and implement a `ready` task — that's [`implementation.instructions.md`](../../instructions/implementation.instructions.md). Never switch into implementation from here, and never start it automatically after refining.

## Rules to read first (do not duplicate them here)

1. [`.github/copilot-instructions.md`](../../copilot-instructions.md) — core rules.
2. `.ai-context/` — all files (architecture, security, UI/UX, gotchas, current epic).
3. [`backlog.instructions.md`](../../instructions/backlog.instructions.md) — in particular "Refinement: inbox idea → task", "Duplicate detection", "Decomposition and Epics", and "Scope control". This is the authoritative checklist; follow it exactly.
4. `backlog/README.md` — backlog structure, task/epic file format, statuses, priorities, ID convention.

## Procedure

### 1. Load context

1. Read `.ai-context/`.
2. Read `backlog/README.md`.
3. Read `backlog/inbox.md`.
4. Read the frontmatter (`id`, `status`, `epic`, `depends_on`, `related_to`) of every `backlog/tasks/*/task.md`.
5. Read every `backlog/epics/*.md`.

### 2. Determine which ideas are in scope

- Full refinement → every bullet under "Ideas" in `backlog/inbox.md` that is **not** already marked `→ converted to FIN-XXX`, `→ duplicate of FIN-XXX`, or `→ already implemented as FIN-XXX`.
- Targeted refinement → only the idea(s) the user identified. If the user-identified idea cannot be found in `backlog/inbox.md`, report this and stop instead of guessing which idea they meant.
- If a full-refinement run finds no pending ideas, say so and stop. Do not invent work.

### 3. Refine each idea

Apply the 7-step checklist from `backlog.instructions.md`'s "Refinement: inbox idea → task" section, in order, to every idea in scope. Do not skip a step or mark `ready` before all steps are resolved:

1. **Analyze** the idea's actual intent. Do not add requirements the idea doesn't imply.
2. **Duplicate/existing-work check** against `backlog/tasks/*/task.md` and `specification.md`, per `backlog.instructions.md`'s "Duplicate detection". Classify the idea using the decision table below.
3. **Related tasks/Epics** — identify links via `related_to` and existing `epic:` membership.
4. **Scope/decomposition** — split into multiple tasks only when the idea genuinely covers independent units of work; group under an Epic only when `backlog.instructions.md`'s Epic-grouping rule is actually met (shared deliverable AND a real dependency between the tasks). Do not split or group speculatively.
5. **Classify** `type`, `priority`, `epic`, `depends_on`, `related_to` using only what the idea and repo context actually support — leave fields empty rather than guessing.
6. **Write** acceptance criteria and `specification.md`, deleting sections that don't apply. Where a requirement needs a product/architectural decision that isn't available, write it explicitly as an open question — never guess.
7. **Decide readiness**: `status: ready` only if every checklist item above is resolved. Otherwise `status: refinement`, with the unresolved decision documented in the task itself (e.g. as an explicit note in `specification.md`/`task.md`). Creating the files is not sufficient to mark a task `ready`.

**Classification decision table** (step 2 outcome determines the required action in section 4 below):

| Classification | Required action |
| --- | --- |
| Genuinely new | Create a new task (section 4, "For each genuinely new... idea"). |
| Extension of existing work | Update the existing task instead of creating a new one; skip straight to step 5 (inbox update). |
| Duplicate | Do not create a task; skip straight to step 5 (inbox update), marking the idea as a duplicate. |
| Already implemented (untracked) | Create the task directly with `status: done`; skip straight to step 5 (inbox update). |
| Already tracked / related but distinct | Do not create a task; skip straight to step 5 (inbox update), referencing the existing task. |

### 4. Create or update task files

For each genuinely new (or scope-extending) idea:

- Allocate the next `FIN-XXX` (highest existing number under `backlog/tasks/` + 1).
- Copy `backlog/tasks/_template/` — this repo's convention is to create all three files (`task.md`, `specification.md`, `implementation.md`) at refinement time, even while the task stays in `refinement` (see e.g. `FIN-039`). For a not-yet-implementable task, `implementation.md` should state that the approach can't be determined yet and why. If `backlog/tasks/_template/` or `backlog.instructions.md` cannot be found, stop and report the missing file rather than proceeding.
- Fill `task.md` frontmatter/body from the template.
- Fill `specification.md`, keeping only relevant sections.
- Create `backlog/epics/<slug>.md` (copy `backlog/epics/_template.md`) only when step 3.4's Epic rule is met; otherwise link via `related_to` instead.
- For an extension of existing work, update the existing task (e.g. add a note, adjust `related_to`) instead of creating a new one.
- For "already implemented but untracked" work, create the task directly with `status: done`, per `backlog.instructions.md`.

### 5. Update `backlog/inbox.md`

- Never delete the original idea line.
- Mark it `→ converted to FIN-XXX` for new/extended tasks, following the exact convention already used in the file.
- For duplicates/already-implemented/already-tracked ideas, mark the line with a reference to the existing task instead of creating a new one.

### 6. Global backlog consistency check

After processing all in-scope ideas, verify:

- No duplicate `FIN-XXX` IDs.
- Every `epic:` value references an existing `backlog/epics/<slug>.md`.
- Every `depends_on`/`related_to` entry references an existing `FIN-XXX`.
- All `status` values are one of the valid statuses in `backlog/README.md`.
- No newly created task duplicates another task.
- Epic files' task lists match the `epic:` field on member tasks.
- No task marked `ready` has an unresolved mandatory refinement decision.

If something can't be safely auto-corrected, report it instead of guessing a fix.

## Out of scope (always)

- No application code changes.
- No edits to `.ai-context/` unless explicitly requested.
- No Git branches, merges, or pushes.
- No implementation of any task.
- Never auto-start the implementation workflow after refining.
- No commits unless explicitly requested.

The output of this Skill is a better-defined backlog — not code, not a branch, not a commit.

## Completion report

Always end with a concise report in this shape:

```
Backlog refinement completed.

Processed: <N> inbox ideas
Created: <N> tasks
Updated: <N> tasks
Duplicates/already tracked: <N>

Ready:
- FIN-XXX — <title>

Still in refinement:
- FIN-XXX — <what decision is missing>

Epics:
- Created: <slug or none>
- Updated: <slug or none>

Application code modified: No
```
