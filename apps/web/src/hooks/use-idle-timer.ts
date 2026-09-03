import { useCallback, useEffect, useRef } from "react"

import { USER_ACTIVITY_EVENT } from "@/lib/api"

const DEFAULT_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
] as const

// Minimum time between activity-triggered timer resets, so a burst of
// mousemove/wheel events doesn't cause a reset (and its listener churn) on
// every single event.
const DEFAULT_THROTTLE_MS = 1000

type UseIdleTimerOptions = {
  /** Milliseconds of inactivity after which `onIdleWarning` fires. */
  warningTimeout: number
  /** Milliseconds of inactivity after which `onIdle` (real logout) fires. */
  logoutTimeout: number
  /** Called once the user has been inactive for `warningTimeout` ms. */
  onIdleWarning: () => void
  /** Called once the user has been inactive for `logoutTimeout` ms. */
  onIdle: () => void
  /** Called on every (throttled) activity, even if it didn't reset the timers. */
  onActivity?: () => void
  /** DOM events considered "activity". Defaults to mouse/keyboard/touch. */
  events?: readonly string[]
  /** Minimum gap between activity-triggered timer resets. */
  throttleMs?: number
  /** Set to false to stop listening without unmounting the component. */
  enabled?: boolean
}

type UseIdleTimerResult = {
  /** Clears both timers and restarts the countdown from now. */
  resetIdleTimer: () => void
}

export function useIdleTimer({
  warningTimeout,
  logoutTimeout,
  onIdleWarning,
  onIdle,
  onActivity,
  events = DEFAULT_EVENTS,
  throttleMs = DEFAULT_THROTTLE_MS,
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
    let lastReset = 0

    function resetTimers() {
      clearTimeout(warningTimeoutId)
      clearTimeout(logoutTimeoutId)
      warningTimeoutId = setTimeout(() => {
        onIdleWarningRef.current()
      }, warningTimeout)
      logoutTimeoutId = setTimeout(() => {
        onIdleRef.current()
      }, logoutTimeout)
    }

    function handleActivity() {
      const now = Date.now()
      onActivityRef.current?.()
      if (now - lastReset < throttleMs) {
        return
      }
      lastReset = now
      resetTimers()
    }

    resetTimersRef.current = () => {
      lastReset = Date.now()
      resetTimers()
    }

    resetTimers()

    for (const eventName of events) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }
    // Emitted by lib/api.ts on every API call, so an in-flight fetch (or a
    // background mutation) counts as activity even without mouse/keyboard input.
    window.addEventListener(USER_ACTIVITY_EVENT, handleActivity)

    return () => {
      clearTimeout(warningTimeoutId)
      clearTimeout(logoutTimeoutId)
      for (const eventName of events) {
        window.removeEventListener(eventName, handleActivity)
      }
      window.removeEventListener(USER_ACTIVITY_EVENT, handleActivity)
    }
  }, [warningTimeout, logoutTimeout, events, throttleMs, enabled])

  const resetIdleTimer = useCallback(() => {
    resetTimersRef.current()
  }, [])

  return { resetIdleTimer }
}
