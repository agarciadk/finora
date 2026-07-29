import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Analytics } from "@/lib/types"

export function useAnalytics(month: number, year: number) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Analytics>(
        `/analytics?month=${month}&year=${year}`
      )
      setAnalytics(data)
    } catch {
      setError("analytics.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  return { analytics, isLoading, error, refresh }
}
