// Small pub/sub used to let plain modules (like lib/api.ts, which lives
// outside the React tree) notify the app that the session ended, without
// coupling them to React context or the router.
export type SessionEndReason = "idle" | "expired"

const target = new EventTarget()
const EVENT_NAME = "finora:session-ended"

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
