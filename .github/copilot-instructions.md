# Copilot instructions — Finora

Always read [`.ai-context/00-ai-instructions.md`](../.ai-context/00-ai-instructions.md) and [`.ai-context/00-coding-skills.md`](../.ai-context/00-coding-skills.md) first — they define general behavior and coding standards for this repo. This file only covers **how to work with the backlog** (`backlog/`). For what the backlog contains and how it's organized, see [`backlog/README.md`](../backlog/README.md).

## Starting work on the backlog

1. Read `.ai-context/` (always, before anything else).
2. Read `backlog/README.md`, then `backlog/inbox.md`.
3. List `backlog/tasks/*/task.md` and check each `status`/`priority`/`epic`/`depends_on`. If a `task.md` is missing required fields or references a non-existent epic or dependency, flag it in a comment and skip it rather than guessing its intent.
4. Prefer a `ready` task. Break ties in this order: (a) highest priority value (`high` > `medium` > `low`); (b) tasks with all `depends_on` already `done` over those with none; (c) earliest `created_at` date; (d) first alphabetically by task ID.
5. If no task is `ready`, refine an `inbox`/`refinement` item instead of inventing unrelated work.

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

## Implementing a task

1. Read `task.md`, `specification.md`, and `implementation.md` in full, then resolve `depends_on` status:
   1. Check whether all `depends_on` tasks are `done`.
   2. If not, assess whether the incomplete work affects the files, APIs, or data structures this task touches.
   3. If it's safe to proceed, note explicitly why the incomplete dependency doesn't affect this task before continuing.
   4. If it's not safe (or a dependency issue is discovered mid-implementation), pause, document the blocker in `implementation.md`, and set `status` back to `refinement` (or note it as blocked).
2. Set `status: in_progress` and update `updated_at` in `task.md`.
3. Keep `implementation.md` current as you go (approach, files affected, step checklist, decisions).
4. Run the relevant tests/validation for the areas touched (see root [README.md](../README.md) for how each app is tested).
5. Set `status: review` once implementation + validation are done.
6. Set `status: done` only once every item in `task.md`'s Definition of Done is satisfied.
7. Don't create a Git commit unless explicitly asked to.
