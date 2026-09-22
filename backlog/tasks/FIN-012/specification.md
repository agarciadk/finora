# Specification

## Context

No footer exists anywhere in `apps/web` today, and no legal/info pages (privacy, terms, about) exist to link from one. This is closely related to FIN-013 (public landing page), since a footer most likely belongs on the (currently non-existent) public/marketing pages more than inside the authenticated dashboard.

## Functional Requirements

- Open questions (need a decision before this can become `ready`):
  - Where does the footer appear — only on public pages (landing/auth), inside the authenticated dashboard, or both?
  - What content (copyright, links to legal pages, social links, version)? None of these pages/content exist yet.

## Out of Scope

- Writing actual legal content (privacy policy/terms) — that's a legal/business deliverable, not an engineering one.
