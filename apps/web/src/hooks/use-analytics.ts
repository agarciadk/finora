import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Analytics, MonthlyEvolution } from "@/lib/types"

const EVOLUTION_MONTHS = 6

function currentPeriod() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

// Adds `delta` months to a {month, year} pair, rolling the year over as needed.
function shiftPeriod(month: number, year: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() }
}

export function useAnalytics() {
  const [period, setPeriod] = useState(currentPeriod)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [evolution, setEvolution] = useState<MonthlyEvolution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Analytics>(
        `/analytics?month=${period.month}&year=${period.year}`
      )
      setAnalytics(data)
    } catch {
      setError("analytics.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refreshAnalytics()
  }, [refreshAnalytics])

  const refreshEvolution = useCallback(async () => {
    try {
      const data = await api.get<MonthlyEvolution[]>(
        `/analytics/evolution?months=${EVOLUTION_MONTHS}`
      )
      setEvolution(data)
    } catch {
      // The evolution chart just stays empty; the KPI cards above already
      // surface a load error for the same underlying analytics failure.
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, doesn't depend on the selected month
    void refreshEvolution()
  }, [refreshEvolution])

  const goToPreviousMonth = useCallback(() => {
    setPeriod(({ month, year }) => shiftPeriod(month, year, -1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setPeriod(({ month, year }) => shiftPeriod(month, year, 1))
  }, [])

  const goToCurrentMonth = useCallback(() => {
    setPeriod(currentPeriod())
  }, [])

  const { month, year } = period
  const { month: nowMonth, year: nowYear } = currentPeriod()
  const isCurrentMonth = month === nowMonth && year === nowYear

  return {
    analytics,
    evolution,
    isLoading,
    error,
    month,
    year,
    isCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    refresh: refreshAnalytics,
  }
}
