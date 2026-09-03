import { useCallback, useEffect, useRef } from "react"

import { USER_ACTIVITY_EVENT } from "@/lib/api"

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
] as const

// Coalesces a burst of activity (continuous mousemove, scroll, etc.) into a
// single timer reset instead of clearing/recreating setTimeouts on every event.
const ACTIVITY_DEBOUNCE_MS = 300

type UseIdleTimerOptions = {
  /** Milliseconds of inactivity after which `onIdleWarning` fires. */
  warningTimeout: number
  /** Milliseconds of inactivity after which `onIdle` (real logout) fires. */
  logoutTimeout: number
  /** Called once the user has been inactive for `warningTimeout` ms. */
  onIdleWarning: () => void
  /** Called once the user has been inactive for `logoutTimeout` ms. */
  onIdle: () => void
  /** Called on every real activity event, even before the debounce settles. */
  onActivity?: () => void
  /** Set to false to stop listening without unmounting the component. */
  enabled?: boolean
}

type UseIdleTimerResult = {
  /** Clears both timers and restarts the countdown from now. */
  resetIdleTimer: () => void
}

// Plain setTimeout-based idle timer: everything lives inside a single
// effect, scoped to this hook instance - no shared/module-level state, no
// polling, nothing for a token refresh elsewhere in the app to desync from.
export function useIdleTimer({
  warningTimeout,
  logoutTimeout,
  onIdleWarning,
  onIdle,
  onActivity,
  enabled = true,
}: UseIdleTimerOptions): UseIdleTimerResult {
  const onIdleWarningRef = useRef(onIdleWarning)
  const onIdleRef = useRef(onIdle)
  const onActivityRef = useRef(onActivity)
  // Populated by the effect below; lets callers (the warning modal's
  // "I'm still here" button) force a reset from outside the effect.
  const resetTimersRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    onIdleWarningRef.current = onIdleWarning
  }, [onIdleWarning])

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    onActivityRef.current = onActivity
  }, [onActivity])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let warningTimeoutId: ReturnType<typeof setTimeout>
    let logoutTimeoutId: ReturnType<typeof setTimeout>
    let debounceTimeoutId: ReturnType<typeof setTimeout>

    function resetTimers() {
      clearTimeout(warningTimeoutId)
      clearTimeout(logoutTimeoutId)
      warningTimeoutId = setTimeout(() => {
        onIdleWarningRef.current()
        logoutTimeoutId = setTimeout(() => {
          onIdleRef.current()
        }, logoutTimeout - warningTimeout)
      }, warningTimeout)
    }

    function handleActivity() {
      onActivityRef.current?.()
      clearTimeout(debounceTimeoutId)
      debounceTimeoutId = setTimeout(resetTimers, ACTIVITY_DEBOUNCE_MS)
    }

    resetTimersRef.current = resetTimers
    resetTimers()

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }
    // Emitted by lib/api.ts on every real API call, so an in-flight fetch
    // counts as activity even without mouse/keyboard input.
    window.addEventListener(USER_ACTIVITY_EVENT, handleActivity)

    return () => {
      clearTimeout(warningTimeoutId)
      clearTimeout(logoutTimeoutId)
      clearTimeout(debounceTimeoutId)
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity)
      }
      window.removeEventListener(USER_ACTIVITY_EVENT, handleActivity)
    }
  }, [warningTimeout, logoutTimeout, enabled])

  const resetIdleTimer = useCallback(() => {
    resetTimersRef.current()
  }, [])

  return { resetIdleTimer }
}
