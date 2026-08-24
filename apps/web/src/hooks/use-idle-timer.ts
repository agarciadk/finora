import { useEffect, useRef } from "react"

const DEFAULT_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "wheel",
] as const

// Minimum time between activity-triggered timer resets, so a burst of
// mousemove/wheel events doesn't cause a reset (and its listener churn) on
// every single event.
const DEFAULT_THROTTLE_MS = 1000

type UseIdleTimerOptions = {
  /** Milliseconds of inactivity after which `onIdle` fires. */
  timeout: number
  /** Called once the user has been inactive for `timeout` ms. */
  onIdle: () => void
  /** DOM events considered "activity". Defaults to mouse/keyboard/touch. */
  events?: readonly string[]
  /** Minimum gap between activity-triggered timer resets. */
  throttleMs?: number
  /** Set to false to stop listening without unmounting the component. */
  enabled?: boolean
}

export function useIdleTimer({
  timeout,
  onIdle,
  events = DEFAULT_EVENTS,
  throttleMs = DEFAULT_THROTTLE_MS,
  enabled = true,
}: UseIdleTimerOptions) {
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>
    let lastReset = 0

    function resetTimer() {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        onIdleRef.current()
      }, timeout)
    }

    function handleActivity() {
      const now = Date.now()
      if (now - lastReset < throttleMs) {
        return
      }
      lastReset = now
      resetTimer()
    }

    resetTimer()

    for (const eventName of events) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }

    return () => {
      clearTimeout(timeoutId)
      for (const eventName of events) {
        window.removeEventListener(eventName, handleActivity)
      }
    }
  }, [timeout, events, throttleMs, enabled])
}
