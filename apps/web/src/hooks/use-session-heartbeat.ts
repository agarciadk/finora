import { useEffect, useRef } from "react"

import { useAuth } from "@/hooks/use-auth"
import { triggerSilentRefresh, USER_ACTIVITY_EVENT } from "@/lib/api"

// DOM signals of real user activity. Deliberately independent from
// use-idle-timer.ts's own listeners (this hook is meant to be usable on its
// own), the small duplication is cheap (just a timestamp write, no re-render).
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
] as const

// How long before the access token actually expires we attempt a silent
// refresh. A UX heuristic, NOT the token lifespan itself (that always comes
// from the backend's `expiresAt`), so hardcoding it here is fine.
const REFRESH_LEAD_MS = 60 * 1000
// Only refresh if there was real activity within this window; an idle tab
// should be left to expire naturally instead of being kept alive forever.
const ACTIVITY_FRESHNESS_MS = 5 * 60 * 1000
// Guards against scheduling a timer with a zero/negative delay (e.g. right
// after mount if `expiresAt` is already very close, or clock skew).
const MIN_SCHEDULE_DELAY_MS = 1000

// Proactively slides the session shortly before the backend's access token
// expires - but only while the user is genuinely active - so someone reading
// the screen without triggering any request never gets hit by a surprise
// 401 on their next action. The actual lifespan is entirely derived from
// `user.expiresAt` (set by the backend on login/refresh/`GET /users/me`),
// never hardcoded here.
export function useSessionHeartbeat() {
  const { isAuthenticated, user } = useAuth()
  const expiresAt = user?.expiresAt
  // 0 (not Date.now()) so the initial render stays pure; the activity
  // effect below stamps a real timestamp as soon as it mounts.
  const lastActivityAtRef = useRef(0)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    function handleActivity() {
      lastActivityAtRef.current = Date.now()
    }

    handleActivity()
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }
    window.addEventListener(USER_ACTIVITY_EVENT, handleActivity)

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity)
      }
      window.removeEventListener(USER_ACTIVITY_EVENT, handleActivity)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      return
    }

    const msUntilRefresh =
      new Date(expiresAt).getTime() - Date.now() - REFRESH_LEAD_MS

    const timeoutId = setTimeout(
      () => {
        const isActive =
          Date.now() - lastActivityAtRef.current < ACTIVITY_FRESHNESS_MS

        if (isActive) {
          void triggerSilentRefresh()
        }
        // If inactive: do nothing. Either the idle-warning modal will show
        // up first, or the token expires and the next real request 401s
        // into the regular reactive refresh - both already handled.
      },
      Math.max(msUntilRefresh, MIN_SCHEDULE_DELAY_MS)
    )

    return () => clearTimeout(timeoutId)
    // Re-schedules automatically whenever `expiresAt` changes (i.e. after
    // every refresh, proactive or reactive), forming a self-sustaining loop.
  }, [isAuthenticated, expiresAt])
}
