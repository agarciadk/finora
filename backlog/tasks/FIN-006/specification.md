# Specification

## Context

Today, per `apps/web/src/components/dashboard-layout.tsx`, `LanguageToggle`/`ModeToggle`/`LogoutButton` already live in the top header (not the sidebar), and profile editing lives inside the Settings/Ajustes tab (`.ai-context/05-current-epic.md`, Smart Logic epic added a Profile tab form). The inbox ideas ask to move profile access to "the top-right corner" (a user-menu pattern) and move language/theme/logout into the sidebar instead — i.e., swap where these two groups of controls live relative to today.

## Functional Requirements

- Open questions (need a UX decision before this can become `ready`):
  - What does "top-right corner" profile access look like — an avatar/user menu dropdown? A dedicated icon button opening a Sheet?
  - Should language/theme/logout become sidebar menu items (bottom of `SidebarContent`, à la a "SidebarFooter") instead of header icons, and if so, do they need labels or just icons+tooltips at the collapsed/icon-only sidebar state?
  - Does moving "profile" out of Settings mean the Settings page loses its Profile tab entirely, or does it become a shortcut into the same tab?

## Out of Scope

- Visual restyling (colors/fonts) — covered separately by `visual-identity-refresh` epic.
