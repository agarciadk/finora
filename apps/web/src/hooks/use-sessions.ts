import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Session } from "@/lib/types"

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Session[]>("/sessions")
      setSessions(data)
    } catch {
      setError("settings.sessions.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const revokeSession = useCallback(
    async (id: string) => {
      await api.delete(`/sessions/${id}`)
      await refresh()
    },
    [refresh]
  )

  const revokeAllOtherSessions = useCallback(async () => {
    await api.delete("/sessions")
    await refresh()
  }, [refresh])

  return { sessions, isLoading, error, revokeSession, revokeAllOtherSessions }
}
