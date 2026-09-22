# Copilot instructions — Finora

Always read [`.ai-context/00-ai-instructions.md`](../.ai-context/00-ai-instructions.md) and [`.ai-context/00-coding-skills.md`](../.ai-context/00-coding-skills.md) before making any change — they define behavior and coding standards for this repo.

## Core rules

- Read `.ai-context/` before touching any code; it holds permanent project knowledge (architecture, auth/security, UI/UX, gotchas, active epic) — see [`.ai-context/README.md`](../.ai-context/README.md).
- Follow the existing architecture, conventions and patterns already established in the codebase; don't introduce new ones unprompted.
- Never invent missing product or architectural requirements. If a significant decision is unresolved, say so instead of guessing.
- Keep changes scoped to what was requested. If you notice other useful work, don't do it opportunistically — log it in [`backlog/inbox.md`](../backlog/inbox.md) instead.
- Protect existing, unrelated user changes: never discard, reset or stash them without a clear reason.
- Never work directly on `main`, force-push, or bypass validation/hooks (e.g. `--no-verify`) to get a change through.
- Don't create new Markdown files to document a change unless asked to.

Work items live in [`backlog/`](../backlog/README.md) (`FIN-XXX` tasks, epics, `inbox.md`) — it's Git-versioned and Markdown-only.

## Specialized instructions

Detailed workflow rules live in `.github/instructions/` and are loaded automatically when relevant:

- [`backlog.instructions.md`](./instructions/backlog.instructions.md) — task selection, refinement, duplicate detection, epics, scope control.
- [`implementation.instructions.md`](./instructions/implementation.instructions.md) — the autonomous "next task" implementation workflow.
- [`git.instructions.md`](./instructions/git.instructions.md) — branch naming/creation and commit conventions.
- [`frontend.instructions.md`](./instructions/frontend.instructions.md) — `apps/web` conventions.
- [`backend.instructions.md`](./instructions/backend.instructions.md) — `apps/api` conventions.
- [`testing.instructions.md`](./instructions/testing.instructions.md) — testing and validation conventions.
