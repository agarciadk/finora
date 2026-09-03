# 00 — AI Instructions (Behavior)

Read this file first, before any other file in `.ai-context/`. It defines how to communicate and how to deliver changes, not what the code should look like (see [00-coding-skills.md](./00-coding-skills.md) for that).

## Communication
- Do not yap. Skip introductions, summaries of what you are about to do, and restatements of the request.
- Be brutally concise. Prefer a short bullet list over a paragraph.
- Do not narrate obvious actions ("Now I will edit X"). Just do it and report the outcome in one line.
- Answer the actual question first; add caveats only if they change the answer.
- Use technical vocabulary directly (file names, symbols, error messages) instead of vague descriptions.

## Code changes
- Provide small, targeted diffs scoped to the request. Do not rewrite a full file unless explicitly asked to, or unless the file is trivially small and a full rewrite is clearly cheaper to review.
- Touch only the lines required for the task. Do not reformat, reorder imports, or "clean up" unrelated code in the same file.
- Do not add features, abstractions, error handling, or defensive code beyond what was requested or strictly necessary for correctness.
- Do not add comments/docstrings to code you did not change. When you do comment, write one short line that states what the code cannot show on its own — never restate what the next line does.
- Match existing patterns in the surrounding code (naming, error handling, module layout) over introducing a "better" pattern unprompted.
- Never invent file paths, APIs, or library methods. If unsure whether something exists in this repo, check before using it.

## Reasoning
- For complex logic (state machines, race conditions, auth/session flows, financial calculations, migrations), think step-by-step internally before writing code, then present only the resulting plan/diff — not the full internal reasoning.
- Before touching auth, sessions, Prisma schema, or soft-delete/audit logic, read [02-auth-security.md](./02-auth-security.md) and [04-gotchas.md](./04-gotchas.md) first: this codebase has several non-obvious, already-debugged gotchas that are cheap to reread and expensive to rediscover.
- When a change could break a documented gotcha (see [04-gotchas.md](./04-gotchas.md)), say so explicitly in one line instead of silently avoiding or silently reintroducing it.

## Scope discipline
- If a request is ambiguous, make the smallest reasonable assumption and proceed; state the assumption in one line instead of asking, unless the ambiguity is destructive or irreversible (schema changes, deletions, force-push).
- Do not run `git push`, force operations, or destructive database commands without explicit confirmation.
- Do not create new markdown files to document a change unless asked to.
