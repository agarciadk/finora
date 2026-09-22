# Specification

## Context

`.ai-context/` already documents architecture/gotchas for AI agents, but is intentionally terse (bullet points, no diagrams) and not written for human onboarding. The inbox idea asks for something more advanced, "quizás con diseño de flujos" (maybe with flow diagrams) — the "maybe" signals this isn't a firm requirement yet.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Where does this documentation live? GitHub Wiki vs. a `docs/` folder vs. extending `.ai-context/`?
  - Is it aimed at humans, agents, or both? (`.ai-context/` is deliberately agent-facing and terse; a human-facing doc set would likely need different structure/depth.)
  - Which flows specifically need diagrams (auth/session? recurring payments? import)?
  - Diagram format/tooling (Mermaid in Markdown vs. external tool)?

## Out of Scope

- Duplicating `.ai-context/` content — per `backlog/README.md`, that content must not be copied, only linked to.
