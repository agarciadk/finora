# Implementation

## Approach

Cannot be determined yet — depends on which state needs to sync (see `specification.md`). If it turns out to be session/logout propagation, the `storage` event or `BroadcastChannel` API (push-based, not polling) would fit the existing `lib/session-events.ts` pub/sub pattern.

## Files / Areas Affected

- Likely `apps/web/src/lib/session-events.ts`, `apps/web/src/contexts/` (AuthProvider), if scoped to session sync.

## Implementation Steps

- [ ] Decide what needs to sync (session/auth vs. UI vs. data) before planning further steps.

## Testing

- [ ] N/A until scope is decided.

## Validation

- [ ] N/A until scope is decided.

## Discovered Work (out of scope)

—

## Notes

Left in `refinement` — implementing this now would require guessing what "synchronization" means, and risks reintroducing the polling/heartbeat pattern already tried and reverted (see `.ai-context/04-gotchas.md`).
