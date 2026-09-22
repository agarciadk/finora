---
description: "Use when creating or switching Git branches for backlog (FIN-XXX) task implementation, naming branches, checking working-tree cleanliness, updating main, or committing changes."
---

# Git branch & commit workflow

Backlog implementation work is never done directly on `main`. Whenever an agent starts implementing a `FIN-XXX` task (or, more rarely, an Epic itself), it must first move onto a dedicated branch created from an up-to-date `main`, in this order:

1. Inspect the current Git status (`git status`).
2. Ensure the working tree is clean — see "Uncommitted changes" below if it isn't.
3. Always fetch the latest remote state (`git fetch origin`) before updating main. If `git fetch origin` fails, stop and report the failure instead of proceeding with a potentially stale `main`.
4. Update local `main` from `origin/main` (e.g. `git switch main && git pull --ff-only origin main`). If `git switch main` fails for any reason, stop and report the error before proceeding. If the fast-forward pull fails due to diverging history, stop and report the conflict instead of forcing a merge or rebase.
5. Create the dedicated branch from the updated `main` — never from another feature branch — or reuse an existing one (see "Existing branches" below).
6. Switch to the new/existing branch.
7. Only then start implementing the task or Epic.

## Branch naming

The prefix is derived from the task's `type` (`task.md` frontmatter):

| `type` | Branch prefix |
|---|---|
| `feature`, `improvement` | `feature/` |
| `bug` | `fix/` |
| `refactor` | `refactor/` |
| `technical`, `chore` | `chore/` |
| `documentation` | `docs/` |

If `type` is missing or does not match a known value, stop and ask which prefix to use before creating the branch.

Branch name: `<prefix>FIN-XXX-short-description`, description short, lowercase, kebab-case:

    feature/FIN-018-category-colors
    fix/FIN-005-mobile-sidebar
    chore/FIN-032-sonarcloud
    refactor/FIN-009-iban-masking

This convention is scoped to backlog (`FIN-XXX`) work. It doesn't replace or rewrite the pre-backlog epic-level `feature/<epic-name>` branches recorded in `.ai-context/05-current-epic.md`'s history — those stay as-is.

### Epic implementation

If an Epic itself is explicitly selected for implementation (rather than one of its member tasks), branch from the latest `main` as `epic/<epic-slug>`. Implement tasks on their own branches unless they share code changes to the same files/modules, in which case implement them together on the epic branch. Never create an Epic branch automatically just because a task belongs to one. If a task's branch and the epic branch modify overlapping files concurrently, coordinate by rebasing the task branch onto the latest epic branch before merging.

### Existing branches

Before creating a branch, check whether a branch for the same `FIN-XXX` task already exists (local or remote) and reuse it instead of creating a duplicate. If it already contains work, inspect its status (`git log`, `git status`) before continuing. If the existing branch was not created from main or is significantly behind, report this before continuing and ask whether to rebase or start fresh. If multiple branches exist for the same FIN-XXX task, stop and ask which one to use before continuing. Never overwrite or delete an existing branch without explicit instruction.

### Uncommitted changes

If the working tree is not clean when starting a task:

- Do NOT automatically discard changes, reset files, or stash without a clear reason.
- Determine whether the changes belong to the current task.
- If they appear unrelated or ownership is unclear, stop and ask for guidance before creating the implementation branch.

## Commits

- Commit following the repository's existing commit-message convention (the Husky pre-commit hook must pass — fix reported issues, never bypass it with `--no-verify`), referencing the FIN ID, e.g. `feat(FIN-018): add category colors`.
- One commit per task unless the repository's conventions require more.
- Outside the autonomous "next task" workflow (see [`implementation.instructions.md`](./implementation.instructions.md)), only commit when explicitly asked to.
- If the pre-commit hook cannot be made to pass after 3 failed attempts to fix the reported issues, stop, leave the task uncommitted, and report the blocker instead of bypassing the hook.

## Never merge or push automatically

Do not merge a branch into `main`, and do not `git push` (or force-push), unless explicitly instructed.
