# AI Context — Finora

Modular context for AI agents. Load only the files relevant to the current task, not the whole directory.

| File | When to load it |
|---|---|
| [00-ai-instructions.md](./00-ai-instructions.md) | **Always read first** — how the AI should communicate and deliver diffs |
| [00-coding-skills.md](./00-coding-skills.md) | **Always read first** — TypeScript/React/Tailwind/shadcn coding standards |
| [01-architecture.md](./01-architecture.md) | Infra changes, monorepo, tsconfig/eslint, Prisma schema, CI/CD, deploy |
| [02-auth-security.md](./02-auth-security.md) | Auth, JWT/cookies, guards, throttling, soft delete, audit log, session/idle |
| [03-ui-ux.md](./03-ui-ux.md) | UI components (base-ui/shadcn), Tailwind, lazy loading, routing, Sheets/Dialogs |
| [04-gotchas.md](./04-gotchas.md) | **Always read before touching code** — strict anti-regression rules |
| [05-current-epic.md](./05-current-epic.md) | Active epic/branch status — update when starting/closing each epic |

Convention: each new epic is documented first in `05-current-epic.md`; when closed, the distilled summary (only reusable rules/gotchas, no narrative) moves to the corresponding topical file (01-04) and `05` is reset.
