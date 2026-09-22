---
description: "Use when selecting the next backlog task, refining an inbox idea into a FIN-XXX task, checking for duplicate or related work, deciding whether to split an idea into multiple tasks, or handling Epics. Covers backlog/inbox.md, backlog/tasks/ and backlog/epics/ workflow rules."
applyTo: "backlog/**"
---

# Backlog workflow

For what the backlog contains and how it is organized (task types, statuses, priorities, IDs, epics, `depends_on`/`related_to`), see `backlog/README.md`.

This file covers agent behavior: how to select, refine and scope backlog work.

Refining inbox ideas, creating or updating Epics, writing specifications, and reviewing the backlog never create a Git branch.

Branches are created only when actual implementation begins. Follow `git.instructions.md` and `implementation.instructions.md` for Git and implementation workflow rules.

## Starting work on the backlog

The steps below describe general/manual backlog review, for example when asked to "review the backlog" or pick something to work on without specifying what.

When the user invokes the autonomous "next task" trigger, follow the implementation workflow instead. In particular, never fall back to refinement when no task is `ready`.

1. Read `.ai-context/` before anything else.
2. Read `backlog/README.md`, then `backlog/inbox.md`.
3. Inspect `backlog/tasks/*/task.md` and check each task's `status`, `priority`, `epic`, and `depends_on`.
   - If a `task.md` is missing required fields or references a non-existent epic or dependency, flag it and skip it rather than guessing its intent.
   - If a skipped or flagged task is a dependency of another task, treat that dependency as unresolved when evaluating readiness.
   - If all tasks are flagged or skipped and no inbox item exists, report the situation and ask the user how to proceed rather than inventing work.
4. Prefer a `ready` task. If more than one task is `ready`, apply the tie-break order below.
5. If no task is `ready`, refine an `inbox` or `refinement` item instead of inventing unrelated work.

### Tie-break order

When multiple tasks are `ready`, apply these criteria in order:

1. Highest priority (`high` > `medium` > `low`).
2. Tasks whose `depends_on` entries are all `done` before tasks with unresolved dependencies.
3. Earliest `created_at` date.
4. First alphabetically by task ID.

If the criteria above cannot distinguish the remaining tasks, flag the ambiguity and ask for clarification before proceeding.

Do not guess.

While awaiting clarification, do not begin implementation on any candidate task. For general/manual backlog review, an inbox item may still be refined if appropriate.

This fallback does not apply under the autonomous "next task" trigger. Under that trigger, ambiguity always means stop and wait for clarification; never switch to refinement.

## Refinement: inbox idea → task

Refinement is analysis, not transcription.

Never turn an inbox line directly into a `ready` task without working through this checklist in order. Complete every item before setting `status: ready`.

- [ ] 1. Analyze the idea.
- [ ] 2. Check for duplicates — stop here if it is already covered.
- [ ] 3. Check for related tasks and Epics.
- [ ] 4. Determine scope — decide whether the idea needs to be decomposed into multiple tasks.
- [ ] 5. Determine `type`: `feature`, `bug`, `improvement`, `refactor`, `technical`, `documentation`, or `chore`.
- [ ] 6. Determine Epic membership, if any.
- [ ] 7. Determine `depends_on` and `related_to`.
- [ ] 8. Write acceptance criteria and fill `specification.md`.
- [ ] 9. Only then set `status: ready`.

Leave the task in `refinement` if any checklist item is unresolved.

Creating `task.md` or `specification.md` files is not, by itself, a reason to mark a task `ready`.

| Step | Decision | Next action |
| --- | --- | --- |
| 2. Check for duplicates | Already implemented, already tracked, or duplicate | Reference the existing task from `inbox.md`; stop refinement |
| | Extension of existing work | Link via `related_to` or add a note to the existing task; stop refinement |
| | Related but distinct, or genuinely new | Continue to step 3 |
| 4. Determine scope | Idea needs decomposition | Split into multiple tasks and group them under an Epic if warranted |
| | Idea is a single coherent unit | Continue to step 5 |

If decomposition produces sub-ideas that are themselves duplicates or extensions of existing work, apply the duplicate detection rules to each sub-idea individually before creating new tasks.
| 9. Set `status: ready` | All checklist items resolved | Mark the task `ready` |
| | Any checklist item unresolved | Leave the task in `refinement` |

## Duplicate detection

Before creating a new `FIN-XXX`, search existing `backlog/tasks/*/task.md` and `specification.md`.

Check titles, summaries, labels, `epic`, `related_to`, and the actual task scope.

Classify the idea as one of:

- already implemented
- already tracked
- duplicate
- extension of existing work
- related but distinct
- genuinely new

Rules:

- **Duplicate:** do not create a new task. Reference the existing task from `inbox.md`.
- **Already implemented but untracked:** create a task with `status: done` for record-keeping and link any relevant commits or files.
- **Extension of existing work:** link it using `related_to`, or add a note to the existing task, rather than opening a disconnected task.
- **Related but distinct:** create a new task and link it using `related_to` when useful.
- **Genuinely new:** proceed with refinement.

Do not infer that two ideas are duplicates solely because they concern the same feature area. Compare their actual scope and intended outcome.

## Decomposition and Epics

A single inbox idea may become several tasks.

For example, "add loans, credit cards and interest calculation" should become separate tasks for credit card accounts, loan accounts, interest calculation, and amortization rather than one giant task.

Group tasks into an Epic only if they share a common deliverable or milestone, AND at least one task depends_on or blocks another task in the group.

Unrelated tasks that merely share a topic area do not qualify.

When an Epic is justified:

- Create `backlog/epics/<slug>.md`.
- Set `epic: <slug>` on each task belonging to it.
- Do not create an Epic for a single task.
- Do not force topically adjacent ideas into the same Epic without real justification.
- A task must remain a coherent, independently implementable and verifiable unit of work.
- Do not split a task purely for the sake of splitting.
- When all tasks under an Epic reach `status: done`, mark the Epic as complete and record the completion date.

## Scope control

- Implement only what is defined by `task.md` and `specification.md`.
- Respect the specification's explicit "Out of Scope" section.
- If you notice other useful work while implementing, do not do it as part of the current task.
- Add discovered work to `backlog/inbox.md` and link it to the current task with `related_to` when useful.
- If a task turns out to be incorrectly scoped during implementation, update `task.md` or `specification.md` and document why. Do not silently expand the scope.