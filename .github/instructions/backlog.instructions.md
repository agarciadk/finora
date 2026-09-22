---
description: "Use when selecting the next backlog task, refining an inbox idea into a FIN-XXX task, checking for duplicate/related work, deciding whether to split an idea into multiple tasks, or handling Epics. Covers backlog/inbox.md, backlog/tasks/ and backlog/epics/ workflow rules."
applyTo: "backlog/**"
---

# Backlog workflow

For what the backlog contains and how it's organized (task types, statuses, priorities, IDs, epics, `depends_on`/`related_to`), see [`backlog/README.md`](../../backlog/README.md). This file covers agent **behavior**: how to select, refine and scope backlog work.

Refining inbox ideas, creating/updating Epics, writing specifications, and reviewing the backlog never create a Git branch (see [`git.instructions.md`](./git.instructions.md)) — branches are created only when actual implementation begins (see [`implementation.instructions.md`](./implementation.instructions.md)).

## Starting work on the backlog

The steps below describe general/manual backlog review (e.g. when asked to "review the backlog" or pick something to work on without specifying what). When the user invokes the autonomous "next task" trigger, follow [`implementation.instructions.md`](./implementation.instructions.md) instead — in particular, never fall back to refinement when no task is `ready`.

1. Read `.ai-context/` (always, before anything else).
2. Read `backlog/README.md`, then `backlog/inbox.md`.
3. List `backlog/tasks/*/task.md` and check each `status`/`priority`/`epic`/`depends_on`. If a `task.md` is missing required fields or references a non-existent epic or dependency, flag it in a comment and skip it rather than guessing its intent. If a skipped/flagged task is a dependency of another task, treat that dependency as unresolved when evaluating readiness.
4. Prefer a `ready` task. If more than one task is `ready`, apply the tie-break order below.
5. If no task is `ready`, refine an `inbox`/`refinement` item instead of inventing unrelated work.

### Tie-break order

When multiple tasks are `ready`, pick the first one that wins on these criteria, applied in order:

1. Highest priority value (`high` > `medium` > `low`).
2. Tasks with all `depends_on` already `done` over those with none.
3. Earliest `created_at` date.
4. First alphabetically by task ID.

If the criteria above cannot distinguish the remaining tasks (e.g. a task is missing `created_at` or another required field), flag the ambiguity and ask for clarification before proceeding — don't guess.

## Refinement (inbox idea → task)

Refinement is analysis, not transcription — never turn an inbox line directly into a `ready` task without working through this checklist, in order. Fill it out explicitly (e.g. as a comment or scratch note) and confirm every item before setting `status: ready`:

- [ ] 1. Analyze the idea.
- [ ] 2. Check for duplicates (see below) — stop here if it's already covered.
- [ ] 3. Check for related tasks/epics.
- [ ] 4. Determine scope — does this idea need to be decomposed into multiple tasks (see below)?
- [ ] 5. Determine `type`: `feature`, `bug`, `improvement`, `refactor`, `technical`, `documentation`, or `chore`.
- [ ] 6. Determine `epic` membership, if any.
- [ ] 7. Determine `depends_on` / `related_to`.
- [ ] 8. Write acceptance criteria and fill `specification.md`.
- [ ] 9. Only then set `status: ready`.

Leave the task in `refinement` if any checklist item is still unresolved. Creating `task.md`/`specification.md` files is not, by itself, a reason to mark a task `ready`.

## Duplicate detection

Before creating a new `FIN-XXX`, search existing `backlog/tasks/*/task.md` and `specification.md` (titles, summaries, labels, `epic`, `related_to`). Classify the idea as one of: already implemented, already tracked, a duplicate, an extension of existing work, related-but-distinct, or genuinely new.

- Duplicate → don't create a new task; reference the existing one from `inbox.md` instead.
- Extension of existing work → link it (`related_to`, or a note in the existing task) rather than opening a disconnected task.
- Genuinely new → proceed with refinement.

## Decomposition & Epics

A single inbox idea may become several tasks — e.g. "add loans, credit cards and interest calculation" should become separate tasks for credit card accounts, loan accounts, interest calculation, and amortization, not one giant task. If the resulting tasks form a coherent larger initiative, group them under a `backlog/epics/<slug>.md` epic and set `epic: <slug>` on each task.

- Don't create an epic for a single task.
- Don't force topically-adjacent ideas into the same epic without real justification (e.g. mobile sidebar behavior and hybrid app packaging aren't automatically the same epic).
- A task should stay a coherent, independently implementable and verifiable unit of work — don't split purely for the sake of splitting.

## Scope control

- Implement only what's in `task.md` plus `specification.md`'s "Out of Scope".
- If you notice other useful work while implementing, don't do it. Finish the current task, then add the discovered work to `backlog/inbox.md` (link it to the current task via `related_to` if useful).
- If a task turns out to be scoped wrong mid-implementation, update `task.md`/`specification.md` and say why — don't silently expand it.
