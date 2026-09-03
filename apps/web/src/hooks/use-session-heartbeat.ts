import { useEffect, useRef } from "react"

import { useAuth } from "@/hooks/use-auth"
import { triggerSilentRefresh, USER_ACTIVITY_EVENT } from "@/lib/api"
import { IDLE_WARNING_TIMEOUT_MS } from "@/lib/idle-config"

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
// Guards against scheduling a timer with a zero/negative delay (e.g. right
// after mount if `expiresAt` is already very close, or clock skew).
const MIN_SCHEDULE_DELAY_MS = 1000

type UseSessionHeartbeatOptions = {
  /**
   * Only refresh if there was real activity within this window; otherwise
   * the tab is left to expire naturally so the idle-warning modal can take
   * over. Defaults to the SAME threshold as `useIdleLogout`'s
   * `warningTimeoutMs` (see lib/idle-config.ts) - the heartbeat must never
   * consider the user "active" for longer than the idle-warning system
   * does, or it keeps the session alive well past the point the user
   * should be considered away and the modal never gets a chance to appear.
   */
  activityTimeoutMs?: number
}

// Proactively slides the session shortly before the backend's access token
// expires - but only while the user is genuinely active - so someone reading
// the screen without triggering any request never gets hit by a surprise
// 401 on their next action. The actual lifespan is entirely derived from
// `user.expiresAt` (set by the backend on login/refresh/`GET /users/me`),
// never hardcoded here.
export function useSessionHeartbeat({
  activityTimeoutMs = IDLE_WARNING_TIMEOUT_MS,
}: UseSessionHeartbeatOptions = {}) {
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
        const isUserActive =
          Date.now() - lastActivityAtRef.current < activityTimeoutMs

        if (isUserActive) {
          // The user is actually doing things: keep the backend session alive.
          void triggerSilentRefresh()
        }
        // If NOT active: do nothing and let the token expire naturally. The
        // idle-warning system (same activityTimeoutMs) takes over from here -
        // refreshing anyway would silently keep resetting the access token
        // without ever letting the warning modal appear.
      },
      Math.max(msUntilRefresh, MIN_SCHEDULE_DELAY_MS)
    )

    return () => clearTimeout(timeoutId)
    // Re-schedules automatically whenever `expiresAt` changes (i.e. after
    // every refresh, proactive or reactive), forming a self-sustaining loop.
  }, [isAuthenticated, expiresAt, activityTimeoutMs])
}
