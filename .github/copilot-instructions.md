# Copilot instructions — Finora

Always read [`.ai-context/00-ai-instructions.md`](../.ai-context/00-ai-instructions.md) and [`.ai-context/00-coding-skills.md`](../.ai-context/00-coding-skills.md) first — they define general behavior and coding standards for this repo. This file only covers **how to work with the backlog** (`backlog/`). For what the backlog contains and how it's organized, see [`backlog/README.md`](../backlog/README.md).

## Starting work on the backlog

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

Refining inbox ideas, creating/updating Epics, writing specifications, and reviewing the backlog never create a Git branch — see "Git branch workflow" below. Branches are created only when actual implementation begins.

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

## Git branch workflow

Backlog implementation work is never done directly on `main`. Whenever an agent starts implementing a `FIN-XXX` task (or, more rarely, an Epic itself — see below), it must first move onto a dedicated branch created from an up-to-date `main`, in this order:

1. Inspect the current Git status (`git status`).
2. Ensure the working tree is clean — see "Uncommitted changes" below if it isn't.
3. Always fetch the latest remote state (`git fetch origin`) before updating main.
4. Update local `main` from `origin/main` (e.g. `git switch main && git pull --ff-only origin main`). If the fast-forward pull fails due to diverging history, stop and report the conflict instead of forcing a merge or rebase.
5. Create the dedicated branch from the updated `main` — never from another feature branch — or reuse an existing one (see "Existing branches" below).
6. Switch to the new/existing branch.
7. Only then start implementing the task or Epic.

### Branch naming

The prefix is derived from the task's `type` (`task.md` frontmatter):

| `type` | Branch prefix |
|---|---|
| `feature`, `improvement` | `feature/` |
| `bug` | `fix/` |
| `refactor` | `refactor/` |
| `technical`, `chore` | `chore/` |
| `documentation` | `docs/` |

Branch name: `<prefix>FIN-XXX-short-description`, description short, lowercase, kebab-case:

    feature/FIN-018-category-colors
    fix/FIN-005-mobile-sidebar
    chore/FIN-032-sonarcloud
    refactor/FIN-009-iban-masking

This convention is scoped to backlog (`FIN-XXX`) work. It doesn't replace or rewrite the pre-backlog epic-level `feature/<epic-name>` branches recorded in `.ai-context/05-current-epic.md`'s history — those stay as-is.

### Epic implementation

If an Epic itself is explicitly selected for implementation (rather than one of its member tasks), branch from the latest `main` as `epic/<epic-slug>`. Prefer implementing the individual `FIN-XXX` tasks belonging to an Epic on their own branches when the work can be meaningfully separated. Never create an Epic branch automatically just because a task belongs to one.

### Existing branches

Before creating a branch, check whether a branch for the same `FIN-XXX` task already exists (local or remote) and reuse it instead of creating a duplicate. If it already contains work, inspect its status (`git log`, `git status`) before continuing. Never overwrite or delete an existing branch without explicit instruction.

### Uncommitted changes

If the working tree is not clean when starting a task:

- Do NOT automatically discard changes, reset files, or stash without a clear reason.
- Determine whether the changes belong to the current task.
- If they appear unrelated or ownership is unclear, stop and ask for guidance before creating the implementation branch.

## Implementing a task

1. Read `.ai-context/` (always, before anything else).
2. Read the relevant `.github/` agent instructions (this file).
3. Read the task's `task.md`.
4. Read `specification.md`.
5. Read `implementation.md`, then resolve `depends_on` status:
   1. Check whether all `depends_on` tasks are `done`.
   2. If not, assess whether the incomplete work affects the files, APIs, or data structures this task touches.
   3. If it's safe to proceed, note explicitly why the incomplete dependency doesn't affect this task before continuing.
   4. If it's not safe (or a dependency issue is discovered mid-implementation), pause, document the blocker in `implementation.md`, and set `status` back to `refinement` (or note it as blocked).
6. Inspect relevant existing code.
7. Check Git status — the working tree must be clean before continuing (see "Uncommitted changes" above if not).
8. Update local `main` from `origin/main` (see "Git branch workflow" above).
9. Create or reuse the dedicated task branch from `main` and switch to it — never implement directly on `main`.
10. Set `status: in_progress` and update `updated_at` in `task.md`, then implement the task, keeping `implementation.md` current as you go (approach, files affected, step checklist, decisions).
11. Run the relevant validation and tests for the areas touched (see root [README.md](../README.md) for how each app is tested). If tests or validation fail, do not proceed to review/done status; fix the issue or document the failure in `implementation.md` and keep `status` as `in_progress`.
12. Review the changes.
13. Update the backlog task status — `review` once implementation + validation are done; `done` only once every item in `task.md`'s Definition of Done is satisfied — and its implementation notes.
14. Commit the changes using the repository's existing commit conventions (Husky-verified pre-commit hook, see `.ai-context/00-ai-instructions.md`) — only if explicitly asked to create a commit. If the pre-commit hook fails, fix the reported issues before retrying the commit; do not bypass the hook.
15. Do not merge the branch into `main` unless explicitly instructed.
