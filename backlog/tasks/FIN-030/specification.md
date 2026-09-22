# Specification

## Context

`apps/web` is a standard Vite/React SPA (`.ai-context/01-architecture.md`) with no existing mobile-packaging tooling (no Capacitor config, no React Native app, no service worker/manifest beyond the basic `site.webmanifest` in `apps/web/public/`). This is a substantial new piece of tooling/infrastructure, not an incremental change.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Technology choice: Capacitor (wraps the existing web app, least rework), React Native (native rewrite, most rework), or an installable PWA (uses the existing `site.webmanifest`, least effort but weakest "native app" feel)? Nothing is decided.
  - Target platforms (iOS, Android, both)?
  - App store distribution requirements (signing, store listing) are out of scope for an AI agent to execute end-to-end regardless of technology chosen.

## Out of Scope

- App store submission/publishing (requires developer accounts, signing certificates — human action).

## Non-Functional Requirements

- Should build on top of whatever comes out of FIN-029 (mobile-first audit) to avoid wrapping a UI that isn't actually usable on a small screen yet.
