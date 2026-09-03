// Small pub/sub used to let plain modules (like lib/api.ts, which lives
// outside the React tree) notify the app that the session ended, without
// coupling them to React context or the router.
import type { AuthUser } from "@/lib/types"

export type SessionEndReason = "idle" | "expired"

const target = new EventTarget()
const EVENT_NAME = "finora:session-ended"
const REFRESHED_EVENT_NAME = "finora:session-refreshed"

export function emitSessionEnded(reason: SessionEndReason) {
  target.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: reason }))
}

export function onSessionEnded(handler: (reason: SessionEndReason) => void) {
  function listener(event: Event) {
    handler((event as CustomEvent<SessionEndReason>).detail)
  }

  target.addEventListener(EVENT_NAME, listener)
  return () => target.removeEventListener(EVENT_NAME, listener)
}

// Emitted after ANY successful /auth/refresh (reactive 401 retry or the
// proactive heartbeat), so AuthProvider can keep `user.expiresAt` (and the
// rest of the profile) in sync without lib/api.ts touching React state.
export function emitSessionRefreshed(user: AuthUser) {
  target.dispatchEvent(new CustomEvent(REFRESHED_EVENT_NAME, { detail: user }))
}

export function onSessionRefreshed(handler: (user: AuthUser) => void) {
  function listener(event: Event) {
    handler((event as CustomEvent<AuthUser>).detail)
  }

  target.addEventListener(REFRESHED_EVENT_NAME, listener)
  return () => target.removeEventListener(REFRESHED_EVENT_NAME, listener)
}
