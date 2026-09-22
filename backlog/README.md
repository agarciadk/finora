# Backlog — Finora

A lightweight, Git-versioned, Markdown-only backlog designed to be read and driven by AI coding agents (and humans). No database, no app, no external tooling — just files under version control.

This file describes **what the backlog contains and how it's organized**. For how an AI agent should behave when working on it (task selection, refinement steps, duplicate detection, scope control), see [`.github/copilot-instructions.md`](../.github/copilot-instructions.md). For permanent project knowledge (stack, architecture, conventions, gotchas), see [`.ai-context/`](../.ai-context/).

## Structure

```
backlog/
├── README.md            # this file — how the backlog is organized
├── inbox.md              # quick-capture list of unrefined ideas
├── epics/
│   ├── _template.md       # copy this file to start a new epic
│   └── <slug>.md          # one file per epic, grouping related FIN-XXX tasks
└── tasks/
    ├── _template/          # copy this folder to start a new task
    │   ├── task.md
    │   ├── specification.md
    │   └── implementation.md
    └── FIN-XXX/            # one formal task per directory
        ├── task.md
        ├── specification.md
        └── implementation.md
```

## Architecture: `.ai-context/` vs `.github/` vs `backlog/`

| | `.ai-context/` | `.github/` | `backlog/` |
|---|---|---|---|
| Answers | "What does the agent need to know about Finora?" | "How should an agent behave?" | "What work exists, and how is it organized?" |
| Contains | Permanent project knowledge: architecture, stack, conventions, gotchas, active dev epic/branch | Agent workflow instructions (repo-wide, and backlog-specific in `copilot-instructions.md`) | Ideas and work items: what to build next, and how a specific task is going |
| Lifespan | Long-lived, updated as the project evolves | Long-lived, updated when the workflow changes | Per-task; a task's files stay as history once `done` |
| Read order | Always read first | Read alongside `.ai-context/`, before touching the backlog | Read after the two above, only the task(s) you're working on |

Never copy `.ai-context/` content into a task to make it "self-contained" — link to it instead. Never put permanent architectural decisions inside `backlog/` — they belong in `.ai-context/`. Never duplicate the agent workflow steps here — they belong in `.github/copilot-instructions.md`.

> Note: `.ai-context/05-current-epic.md` tracks the *current development branch/epic* for coding-behavior context (what's actively being coded, gotchas as-you-go). It is unrelated to the `backlog/epics/` concept below, which groups planning-level `FIN-XXX` tasks.

## `inbox.md`

The capture stage. See [inbox.md](./inbox.md). Anyone (human or agent) can append a one-line idea under "Ideas" with no required structure — no ID, no type, no priority, no spec, no acceptance criteria. Not every idea becomes a task, and ideas don't need to be processed in order. Once an idea is converted into a task, its line is marked `→ converted to FIN-XXX` instead of being deleted, so the origin of a task isn't lost.

## Formal tasks (`backlog/tasks/FIN-XXX/`)

A formal task is a directory named `FIN-XXX` (e.g. `FIN-001`) containing three files:

- **`task.md`** — What are we building, and when is it done? YAML frontmatter (`id`, `type`, `status`, `priority`, `epic`, `labels`, `depends_on`, `related_to`, `created_at`, `updated_at`) + summary, user story, acceptance criteria, Definition of Ready, Definition of Done.
- **`specification.md`** — What exactly should the system do? Functional/technical spec. Only include sections that are actually relevant to the task; never invent requirements — mark unknowns explicitly instead of guessing.
- **`implementation.md`** — How is/was this implemented? Approach, affected areas, step checklist, testing/validation checklist, branch, commits, discovered follow-up work, notes.

Copy `backlog/tasks/_template/` to `backlog/tasks/FIN-XXX/` when creating a new task.

### Task IDs

- Format: `FIN-001`, `FIN-002`, `FIN-003`, ... (zero-padded to 3 digits, increment past 999 without re-padding if ever needed).
- Unique, sequential, assigned once, never reused, never renamed even if the title changes later.
- IDs are **not** derived from the title.
- To find the next available ID: list the directories under `backlog/tasks/` matching `FIN-\d+`, take the highest number, add 1. If none exist yet, start at `FIN-001`.

### Task types (`task.md` frontmatter: `type`)

- `feature` — new user-facing capability.
- `bug` — incorrect existing behavior.
- `improvement` — enhances something that already works.
- `refactor` — internal code change, no behavior change.
- `technical` — infra/tooling/CI/build/deploy work tied to a specific change.
- `documentation` — docs-only change.
- `chore` — repository/engineering maintenance and infrastructure work not tied to a single change (e.g. SonarCloud, Semgrep, CodeQL, dependency/logging setup, recurring maintenance).

Keep this taxonomy small; don't introduce new types without a clear, recurring need.

### Task relationships (`task.md` frontmatter)

- `epic` — the slug of a `backlog/epics/<slug>.md` file this task belongs to, if any. Empty if the task is standalone.
- `depends_on` — list of `FIN-XXX` IDs that must be `done` before this task can start. Empty if none.
- `related_to` — list of `FIN-XXX` IDs (or epic slugs) that provide useful context but aren't hard dependencies. Empty if none.

These exist so an agent can understand how pieces of work relate to each other — not to build a dependency graph or project-management tool. Leave fields empty rather than filling them speculatively.

## Epics (`backlog/epics/<slug>.md`)

An epic groups multiple related `FIN-XXX` tasks that together represent a larger initiative (e.g. "Loans & Credit", "Banking Integration"). Use an epic only when there's a meaningful collection of related tasks — not for every idea, and not just because two ideas are topically adjacent.

An epic file (copy `backlog/epics/_template.md`) is intentionally small: an id/slug, title, status (`active` or `done`), a short summary, and the list of `FIN-XXX` tasks that belong to it. It is not a hierarchy, not a second task type, and doesn't carry its own acceptance criteria — those live on the member tasks.

## Statuses (`task.md` frontmatter: `status`)

- `inbox` — idea exists, not yet formalized into a task (in practice, this state is `inbox.md`; a task directory tagged `inbox` means it was created prematurely and still needs refinement).
- `refinement` — formalized but scope, behavior, edge cases, dependencies, or acceptance criteria are still being worked out. Must not move to `ready` while important decisions remain unresolved.
- `ready` — clear objective, clear acceptance criteria, relevant spec, dependencies identified, no major open functional questions.
- `in_progress` — an agent is actively implementing it.
- `review` — implementation complete, relevant tests/validation already run, awaiting review.
- `done` — Definition of Done in `task.md` is satisfied.

## Priorities (`task.md` frontmatter: `priority`)

- `high`, `medium`, `low`. No numeric scoring system — priority is a hint for choosing between multiple `ready` tasks, not a project-management algorithm.

## Lifecycle

```mermaid
flowchart LR
    Inbox --> Refinement --> Ready --> InProgress[In Progress] --> Review --> Done
```

See [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) for the concrete agent workflow (refinement steps, duplicate detection, decomposition, scope control) that drives these transitions.
