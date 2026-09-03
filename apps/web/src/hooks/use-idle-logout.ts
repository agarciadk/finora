import { useCallback, useEffect, useRef, useState } from "react"

import { useAuth } from "@/hooks/use-auth"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import {
  IDLE_LOGOUT_TIMEOUT_MS,
  IDLE_WARNING_TIMEOUT_MS,
} from "@/lib/idle-config"

// How often the visible countdown recomputes. Recomputing from a fixed
// deadline (Date.now() diff) rather than decrementing by 1 each tick means
// the displayed number can't drift even if the interval itself is delayed.
const COUNTDOWN_TICK_MS = 250

type UseIdleLogoutOptions = {
  /** Milliseconds of inactivity before the warning modal appears. */
  warningTimeoutMs?: number
  /** Milliseconds of inactivity before the session is actually closed. */
  logoutTimeoutMs?: number
}

type UseIdleLogoutResult = {
  /** Whether the "are you still there?" warning should be shown. */
  isIdleWarning: boolean
  /** Seconds left before the session closes, live-updated every tick. */
  remainingSeconds: number
  /** Dismisses the warning and restarts the idle clock from now. */
  resetIdleTimer: () => void
}

// Logs the user out once they've been inactive for `logoutTimeoutMs`,
// surfacing a warning (with a live countdown) `warningTimeoutMs` in. Only
// listens for activity while there's an active session (ProtectedRoute
// unmounts this once `endSession` flips `isAuthenticated` to false).
export function useIdleLogout({
  warningTimeoutMs = IDLE_WARNING_TIMEOUT_MS,
  logoutTimeoutMs = IDLE_LOGOUT_TIMEOUT_MS,
}: UseIdleLogoutOptions = {}): UseIdleLogoutResult {
  const { isAuthenticated, endSession } = useAuth()
  const countdownSeconds = Math.round(
    (logoutTimeoutMs - warningTimeoutMs) / 1000
  )

  const [isIdleWarning, setIsIdleWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(countdownSeconds)
  const countdownDeadlineRef = useRef<number | null>(null)
  // Guards against the countdown tick and the logoutTimeout timer both
  // trying to end the session (they target the same instant by design).
  const hasEndedRef = useRef(false)

  const clearWarning = useCallback(() => {
    countdownDeadlineRef.current = null
    setIsIdleWarning(false)
  }, [])

  const triggerLogout = useCallback(() => {
    if (hasEndedRef.current) {
      return
    }
    hasEndedRef.current = true
    clearWarning()
    void endSession("idle")
  }, [clearWarning, endSession])

  const handleIdleWarning = useCallback(() => {
    hasEndedRef.current = false
    countdownDeadlineRef.current = Date.now() + (logoutTimeoutMs - warningTimeoutMs)
    setRemainingSeconds(countdownSeconds)
    setIsIdleWarning(true)
  }, [countdownSeconds, logoutTimeoutMs, warningTimeoutMs])

  // Any real activity (DOM event or API call, see use-idle-timer.ts) should
  // silently dismiss an already-open warning instead of requiring the user
  // to click "I'm still here" - this is what actually fixes the bug where
  // active users got logged out.
  const handleActivity = useCallback(() => {
    hasEndedRef.current = false
    if (countdownDeadlineRef.current !== null) {
      clearWarning()
    }
  }, [clearWarning])

  const { resetIdleTimer: resetIdleTimerInternal } = useIdleTimer({
    warningTimeout: warningTimeoutMs,
    logoutTimeout: logoutTimeoutMs,
    onIdleWarning: handleIdleWarning,
    onIdle: triggerLogout,
    onActivity: handleActivity,
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (!isIdleWarning) {
      return
    }

    const intervalId = setInterval(() => {
      const deadline = countdownDeadlineRef.current
      if (deadline === null) {
        return
      }
      const secondsLeft = Math.ceil((deadline - Date.now()) / 1000)
      setRemainingSeconds(Math.max(secondsLeft, 0))
      if (secondsLeft <= 0) {
        triggerLogout()
      }
    }, COUNTDOWN_TICK_MS)

    return () => clearInterval(intervalId)
  }, [isIdleWarning, triggerLogout])

  const resetIdleTimer = useCallback(() => {
    hasEndedRef.current = false
    clearWarning()
    resetIdleTimerInternal()
  }, [clearWarning, resetIdleTimerInternal])

  return { isIdleWarning, remainingSeconds, resetIdleTimer }
}

