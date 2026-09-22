# Specification

## Context

The frontend today uses React context for auth (`AuthProvider`) and local/per-hook state elsewhere (e.g. `useAnalytics`). Introducing Zustand without a specific problem to solve risks becoming an unmotivated architecture change purely for its own sake, which `.ai-context/00-ai-instructions.md` explicitly warns against ("do not add abstractions ... beyond what was requested or strictly necessary").

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - What specific state is currently painful to manage (prop drilling? duplicated fetches?) that Zustand would solve? Nothing specific is named in the inbox.
  - Does this replace `AuthProvider`'s context, or coexist alongside it for new state only?

## Out of Scope

- Migrating existing, working context/hook-based state without a concrete pain point identified first.
