---
id: monetization
title: Monetization
status: active
created_at: 2026-09-22
updated_at: 2026-09-22
---

# monetization — Monetization

## Summary

The inbox idea "Crear capa de pago, añadir anuncios" bundles two distinct, independent monetization mechanisms (a paid/subscription layer, and advertising) into one line. Split into two tasks since they represent different implementation efforts and could be pursued independently (or not at all — they're arguably in tension, since a paid tier typically removes ads).

## Tasks

- [ ] FIN-039 — Add a payment/subscription layer
- [ ] FIN-040 — Add advertising

## Notes

- Both tasks stay in `refinement`: there is no business model defined (pricing, what's gated behind payment, ad network, ad placement) anywhere in `.ai-context/` or the inbox. This is a product/business decision, not an engineering one, and should not be guessed.
- Flagging the tension explicitly: shipping both a paid tier and ads in the same app is a product decision that should be resolved (e.g. "ads only on the free tier") before either task can move to `ready`.
