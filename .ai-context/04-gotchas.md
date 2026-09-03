# 04 — Gotchas & Strict Rules

Rules distilled from bugs already experienced in this repo. Read them before touching the related area — avoid reintroducing already-fixed bugs.

## Dependencies / pinning
- ⚠️ When a dependency is pinned due to a known incompatibility (ESM-only, peer version), ALWAYS use an EXACT version (no `^`/`~`). A caret range lets a later `pnpm install` silently bump it and reintroduce the bug.
  - `sanitize-html`: pin to exactly `2.17.5` (>=2.17.6 pulls in `htmlparser2@12`, ESM-only, breaks Jest with "Cannot use import statement outside a module"; works at real runtime via Node≥22.12's `require(esm)` but not in Jest).
  - `@nestjs/config`: pin to exactly `4.0.4` (12.x is ESM-only, same problem).
  - `@nestjs/swagger`: use the `^11.x` line (do NOT install without pinning — the latest may require `@nestjs/common@^12` as a peer and break at runtime with a `SyntaxError` on startup). ALWAYS check `npm view <pkg> versions` + peerDependencies before installing latest if the rest of the monorepo uses a different major.
  - `xlsx` (SheetJS): ALWAYS install from the sheetjs.com tarball (`pnpm add xlsx@https://cdn.sheetjs.com/...`), NEVER from the regular npm registry (the latest there, 0.18.5, has an unpatched prototype-pollution vulnerability — SheetJS abandoned npm).
- ⚠️ `pnpm add` with an unapproved postinstall can insert a placeholder entry under `allowBuilds` in `pnpm-workspace.yaml` with the literal string `'set this to true or false'` instead of a boolean — breaks ANY subsequent `pnpm install` (including the pre-commit hook) with `[ERR_PNPM_IGNORED_BUILDS]`. Edit it manually to `true`/`false`.
- Never declare `eslint`/`typescript-eslint`/etc. as deps of the shared config package (see [01-architecture.md](./01-architecture.md)).

## Prisma
- ⚠️ `PrismaService` forwards props via a `Proxy` to the extended client. Calling a TOP-LEVEL method through the proxy (e.g. `this.prisma.$transaction(fn)`) binds `this` to the Proxy, not the real client, and breaks Prisma's runtime. ALWAYS use `this.prisma.runInTransaction(fn)` (calls `this.client.$transaction` internally).
- Build extensions with `Prisma.defineExtension(...)`, never cast a separate config object with `as Parameters<typeof client.$extends>[0]` — the cast collapses the return type to `unknown` across every downstream service.
- The return type of `deleteMany` rewritten by the soft-delete extension is `unknown` for TS — do not try to hand-type `SoftDeleteDelegate.updateMany`; use the count already validated earlier instead of reading `.count` from the result.
- `moduleFormat = "cjs"` is mandatory in `schema.prisma` (`prisma-client` generator) or it breaks Nest's CJS build.
- Before `prisma generate`: `rm -rf src/generated/prisma` if there are versioned empty folders (error "exists and is not empty...").
- Jest: as soon as a spec touches `PrismaService`/the generated client, it fails with `Cannot find module './internal/class.js'` (relative imports with explicit `.js`, NodeNext-style) — fix with `moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"}` in the jest config. **Pending**: `test/jest-e2e.json` doesn't have this mapper yet.

## React / StrictMode / effects
- ⚠️ To "skip an effect's reaction on mount" or "act only the first time X changes" under StrictMode (double-invoke): ALWAYS use a `useRef` holding the LAST SEEN VALUE and compare BY VALUE (`if (value !== ref.current) { ref.current = value; ...}`). NEVER a boolean "already ran once" flag — it gets consumed on the first of the two simulated invocations, and the second ("real") one already finds it spent.
  - Applies to: fetch dedupe for a single-use token (`verify-email`), search debounce that must not reset the page on mount (`transactions-page.tsx`).
- Do not combine a "last value" ref with a `cancelled`/cleanup flag in the same effect — StrictMode's synthetic cleanup can set `cancelled=true` before the real promise resolves, so state never updates (worse than the original bug). If the fetch is single-use (stable token), drop `cancelled` entirely.
- Mutating `ref.current` INSIDE the component body (not in a `useEffect`) breaks with `eslint-plugin-react-hooks@7` (`react-hooks/refs` rule).
- `react-hooks/set-state-in-effect` (v7) breaks the standard fetch-on-mount pattern — disable it line-by-line with a comment; there's no clean alternative without a data-fetching library.

## React Router v7
- ⚠️ v7 wraps ALL navigation (`Link`/`NavLink`/`navigate()`) in `React.startTransition` UNCONDITIONALLY (not opt-in). If the new route's lazy component suspends inside that transition, React keeps the OLD `<Suspense>` content (doesn't show the fallback) — that's why Suspense works on initial load but not when navigating via the Sidebar.
- Fixes that do NOT work: `useDeferredValue(useLocation())` (catches up in the same pass), Data Router + `RouterProvider`/`flushSync` (reintroduces a blank screen without `HydrateFallback`, downloads chunks before `ProtectedRoute` can redirect), a custom `useTransition()` unmounting `<Outlet/>` while pending (the `import()` never fires → deadlock).
- Fix that DOES work: preload the chunk BEFORE navigating with plain state (no transition) — see `ROUTE_PRELOADERS` in [03-ui-ux.md](./03-ui-ux.md).

## Base UI (components)
- `Menu.GroupLabel` (`DropdownMenuLabel`) MUST be inside `Menu.Group` (`DropdownMenuGroup`) — otherwise runtime error "MenuGroupContext is missing" (doesn't fail build/lint).
- Tests for components that open `DropdownMenu`/`Menu`: ALWAYS use `await screen.findByRole(...)` (never a synchronous `getByRole`) — the popup mounts in an async portal.
- Playwright: `getByLabel(...)` on a base-ui `Switch` causes a "strict mode violation" (matches both the visible switch AND a hidden `input[type=checkbox] aria-hidden`) — use `getByRole("switch", {name})`.
- Playwright: `getByLabel("X")` without `{exact:true}` also matches labels that are a superstring ("X" vs "Confirm your X") — use `exact: true`.
- Playwright: wait for a Sheet to close (`await expect(heading).not.toBeVisible()`) BEFORE text assertions that could collide with values also visible inside the form/combobox.

## Testing
- DTOs with `class-validator`/`class-transformer` decorators imported OUTSIDE a Nest `TestingModule` need `import 'reflect-metadata'` at the top of the spec, or they fail with "Reflect.getMetadata is not a function".
- `userEvent.upload` filters files by the input's `accept` attribute — to test rejection of an invalid extension, use `userEvent.setup({applyAccept: false})`.
- If rendering an auth/context provider's `children` is gated on async state (e.g. `isLoading`), audit ALL tests that mount that provider and run SYNCHRONOUS queries right after `render()` — they now need `await waitFor(...)`/`findBy*`. The initial value of `renderHook().result.current` in RTL is `null`, not `undefined` (`.not.toBeNull()`, not `.toBeDefined()`).
- Simulating a slow network with `page.route(...sleep...)` against `pnpm dev` is unreliable (accumulated handlers without `page.unroute()`, HTTP cache in new tabs, HMR serving routes different from production). Prefer a temporary deterministic delay directly in the code, verify, then revert.
- Before running Playwright locally: kill any process on :3000/:5173 — if Playwright reuses an already-running server (`reuseExistingServer: !CI`), that process may lack `NODE_ENV=test` and break test backdoors (e.g. `verificationToken` won't travel in the register response).
- The pre-commit hook (husky) runs a full lint+vitest+e2e+a11y suite (~50s-1m20s) and requires a real Postgres (`docker compose up -d postgres`) — confirm `docker info` before assuming a commit failure is caused by new code.

## Session / idle / auth (frontend)
- ⚠️ Do NOT add a proactive session-refresh mechanism (heartbeat/polling). Already tried (activity singleton + 250ms polling) and dropped as over-engineering — the existing reactive retry on 401 in `lib/api.ts` is sufficient.
- The idle-timer's activity events array MUST include `click`/`scroll` in addition to mousemove/mousedown/keydown/touchstart/wheel, AND the custom event fired by every API call (see [02-auth-security.md](./02-auth-security.md)) — otherwise active users making only background calls get logged out for "inactivity".
- A warning modal's countdown must be recalculated from a fixed `deadline` (`Date.now()+delta`), never decremented by 1 (drifts if `setInterval` lags).

## Other
- Prisma's `Decimal(5,2)` → JSON serialization does NOT zero-pad (`3` does not become `"3.00"`) — in exact-text assertions, use the value as originally entered.
- Routes with a literal prefix (`bulk/...`) must be declared BEFORE parameterized routes (`:id`) in Nest controllers — otherwise Nest matches the literal as if it were the parameter (declaration order, no automatic priority).
- Any field the frontend might send in a creation body must exist (even if optional) in the creation DTO — `ValidationPipe({whitelist:true, forbidNonWhitelisted:true})` rejects with a generic 400 and no clear message if it's missing.
