# 00 — Coding Skills (Tech Standards)

Strict coding standards for this stack (NestJS + Prisma on `apps/api`, React + Vite on `apps/web`). Pair with [00-ai-instructions.md](./00-ai-instructions.md) for behavior rules, and with [01-architecture.md](./01-architecture.md)/[02-auth-security.md](./02-auth-security.md)/[03-ui-ux.md](./03-ui-ux.md) for repo-specific patterns.

## TypeScript
- Never use `any`. If a third-party type is genuinely uncooperative, isolate the unsafe cast to the smallest possible scope and add a one-line comment explaining why (see the Prisma extension gotcha in [04-gotchas.md](./04-gotchas.md) for a precedent).
- Define an `interface` or `type` for every non-trivial function argument, return value, and DTO. Do not rely on inferred `object`/inline shapes for anything that crosses a module boundary.
- Prefer `type` for unions/utility compositions and `interface` for object shapes that may be extended (e.g. declaration merging on `PrismaService`).
- Use `import type` for type-only imports in files with decorators (`emitDecoratorMetadata` breaks otherwise on parameter decorators).
- Model nullability explicitly (`string | null` vs `string | undefined`) — do not collapse them. Guard `null`/`undefined` at the boundary where the value is consumed, not everywhere downstream.
- Never silence a type error with `as unknown as T`. Fix the underlying type, or narrow with a guard.
- Run `tsc`/the project's typecheck script before considering a change done; do not rely on the editor alone.

## Backend (NestJS)
- One responsibility per service method; keep controllers thin (validation via DTOs + guards, delegate logic to services).
- Every DTO field the frontend can send must be declared (even if optional) — `ValidationPipe({ forbidNonWhitelisted: true })` silently rejects unknown fields.
- Use `class-validator`/`class-transformer` decorators for all input validation; never hand-roll validation in the controller body.
- Use `PrismaService#runInTransaction(...)` for any multi-step write that must be atomic — never call `this.prisma.$transaction(...)` directly through the proxy (see [04-gotchas.md](./04-gotchas.md)).
- Money/amount fields are decimal strings end-to-end (API boundary and parsing) — never `parseFloat`/`number` for currency.

## React
- Function components only. No class components.
- Extract non-trivial logic (data fetching, timers, event listeners, derived state) into a custom hook (`use-xxx.ts`) instead of inlining it in the component body.
- Keep `useEffect` minimal and justified: prefer deriving state during render or initializing `useState` lazily over syncing props to state with an effect.
- Under `StrictMode`, never gate "run once" logic with a boolean ref that gets consumed on the first pass — compare against a ref holding the last-seen value instead (see [04-gotchas.md](./04-gotchas.md) for the two documented incidents).
- Name hook dependencies explicitly and completely; do not disable `react-hooks/exhaustive-deps` to silence a real dependency — restructure the effect instead.
- Co-locate one component per file; name the file after the exported component in kebab-case, matching the existing `apps/web/src/components`/`pages` layout.
- Export page components as named exports (required by the lazy-loading pattern in [03-ui-ux.md](./03-ui-ux.md)).

## Tailwind
- Group utility classes by concern, in this order: layout (`flex`/`grid`/`gap`) → sizing (`w-`/`h-`/`min-`/`max-`) → spacing (`p-`/`m-`) → typography (`text-`/`font-`) → color/background → state variants (`hover:`/`data-[...]:`) → responsive/dark prefixes last.
- Do not inline arbitrary values (`w-[123px]`) when a design-token utility already covers the case.
- Extract a class string to a named constant/`cn()` call only when it repeats or when conditional logic makes the inline JSX hard to read — do not prematurely abstract a one-off className.
- Respect flex/overflow constraints when nesting scrollable areas: a scrollable flex child needs `min-h-0` alongside `overflow-y-auto`, or it will expand its container instead of scrolling.

## Shadcn UI
- Compose, don't fork: build new UI from existing primitives in `apps/web/src/components/ui/` (`Sheet`, `AlertDialog`, `Dialog`, `Popover`, `Select`, `DropdownMenu`) instead of introducing a new UI library for something an existing primitive already covers.
- When adding a new primitive, follow the structure of the closest existing one (e.g. model new overlay components after `alert-dialog.tsx`: Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close).
- Keep shared `ui/` components generic and page-agnostic. Apply page-specific layout fixes (e.g. scroll containers) locally in the consuming page, not in the shared primitive, unless every usage is verified.
- Compound components (`Menu.Group`/`Menu.GroupLabel`, etc.) must be nested exactly as the primitive requires — check the primitive's own composition rules before assuming a flatter structure works at runtime.
- Type generic primitives explicitly where the library has no default (e.g. `Select.Root.Props<Value, Multiple>`) — do not let it fall back to an implicit/incorrect generic.
