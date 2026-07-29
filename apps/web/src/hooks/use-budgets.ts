import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Budget } from "@/lib/types"

export type BudgetInput = {
  categoryId: string
  limit: number
  month: number
  year: number
}

export function useBudgets(month: number, year: number) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Budget[]>(
        `/budgets?month=${month}&year=${year}`
      )
      setBudgets(data)
    } catch {
      setError("budgets.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createBudget = useCallback(
    async (input: BudgetInput) => {
      const created = await api.post<Budget>("/budgets", input)
      await refresh()
      return created
    },
    [refresh]
  )

  const updateBudget = useCallback(
    async (id: string, input: Partial<BudgetInput>) => {
      const updated = await api.patch<Budget>(`/budgets/${id}`, input)
      await refresh()
      return updated
    },
    [refresh]
  )

  const deleteBudget = useCallback(
    async (id: string) => {
      await api.delete(`/budgets/${id}`)
      setBudgets((current) => current.filter((budget) => budget.id !== id))
    },
    []
  )

  return {
    budgets,
    isLoading,
    error,
    refresh,
    createBudget,
    updateBudget,
    deleteBudget,
  }
}
