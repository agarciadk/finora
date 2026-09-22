---
id: mobile-application
title: Mobile Application
status: active
created_at: 2026-09-22
updated_at: 2026-09-22
---

# mobile-application — Mobile Application

## Summary

Groups everything related to Finora's mobile experience: a concrete mobile navigation bug, a broader mobile-first responsive pass, and the longer-term ambition of shipping a hybrid mobile app. The three inbox ideas ("Mobile First", "el sidebar debería ocultarse...", "Convertir la aplicación a aplicación híbrida") are distinct but form one initiative — mobile-first work is a realistic precondition for a good hybrid-app experience.

## Tasks

- [ ] FIN-005 — [Bug] Mobile sidebar does not close after navigating to a page
- [ ] FIN-029 — Mobile-first responsive audit and improvements
- [ ] FIN-030 — Package Finora as a hybrid mobile application

## Notes

- FIN-005 is a concrete, verified bug (confirmed by code inspection of `apps/web/src/components/app-sidebar.tsx`) and is `ready` independently of the rest of the epic.
- FIN-030 is `related_to` FIN-029: doing the mobile-first pass first is recommended but not enforced as a hard `depends_on`, since a hybrid wrapper could technically start before the responsive audit is finished.
- FIN-029 and FIN-030 stay in `refinement` — no scope/technology decisions exist yet (which pages are in/out of scope for "mobile-first"; Capacitor vs React Native vs PWA for the hybrid app).
