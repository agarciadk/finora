import { useCallback } from "react"

import { useAuth } from "@/hooks/use-auth"
import { useIdleTimer } from "@/hooks/use-idle-timer"

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000

// Logs the user out once they've been inactive for `timeoutMs`. Only listens
// for activity while there's an active session (ProtectedRoute unmounts this
// once `endSession` flips `isAuthenticated` to false).
export function useIdleLogout(timeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS) {
  const { isAuthenticated, endSession } = useAuth()

  const handleIdle = useCallback(() => {
    void endSession("idle")
  }, [endSession])

  useIdleTimer({
    timeout: timeoutMs,
    onIdle: handleIdle,
    enabled: isAuthenticated,
  })
}
