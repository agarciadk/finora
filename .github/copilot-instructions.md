# Copilot instructions — Finora

Always read `.ai-context/00-ai-instructions.md` and `.ai-context/00-coding-skills.md` before making any change. These files define the repository's AI behavior and coding standards.

If either file is missing or empty, stop and report this to the user before proceeding with any change.

## Core rules

- Read `.ai-context/` before touching any code; it holds permanent project knowledge (architecture, auth/security, UI/UX, gotchas, active epic).
- Follow the existing architecture, conventions and patterns already established in the codebase; don't introduce new ones unprompted.
- Never invent missing product or architectural requirements. A decision is significant if it affects data models, public APIs, security, or cannot be easily reversed; in these cases, stop and ask instead of guessing.
- Keep changes scoped to what was requested. Any change not explicitly requested — including refactors, unrelated bug fixes, or style improvements — must be logged in `backlog/inbox.md` rather than applied, even if trivial.
- Protect existing, unrelated user changes: never discard, reset or stash them without a clear reason.
- Never work directly on `main`, force-push, or bypass validation/hooks (for example, `--no-verify`) to get a change through.
- Don't create documentation files as part of an implementation unless the task explicitly requires documentation or the existing workflow requires updating documentation.
- If completing a task appears to require violating a core rule, stop and ask the user for guidance rather than proceeding.

Work items live in `backlog/` (`FIN-XXX` tasks, epics, `inbox.md`) and are Git-versioned Markdown files.

## Specialized instructions

Detailed workflow rules live in `.github/instructions/` and are loaded automatically when relevant. If a specialized instruction conflicts with the core rules above, the core rule takes precedence unless the specialized instruction explicitly defines a more specific behavior.

- `backlog.instructions.md` — task selection, refinement, duplicate detection, epics and scope control.
- `implementation.instructions.md` — autonomous "next task" implementation workflow.
- `git.instructions.md` — branch naming, branch creation and commit conventions.
- `frontend.instructions.md` — `apps/web` conventions.
- `backend.instructions.md` — `apps/api` conventions.
- `testing.instructions.md` — testing and validation conventions.