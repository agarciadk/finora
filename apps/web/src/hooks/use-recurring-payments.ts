import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type {
  ExecuteRecurringPaymentResult,
  RecurringFrequency,
  RecurringPayment,
  TransactionType,
} from "@/lib/types"

export type RecurringPaymentInput = {
  accountId: string
  categoryId: string
  name: string
  amount: number
  type: TransactionType
  frequency: RecurringFrequency
  startDate: string
  isActive?: boolean
}

export function useRecurringPayments() {
  const [recurringPayments, setRecurringPayments] = useState<
    RecurringPayment[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<RecurringPayment[]>("/recurring-payments")
      setRecurringPayments(data)
    } catch {
      setError("recurringPayments.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createRecurringPayment = useCallback(
    async (input: RecurringPaymentInput) => {
      const created = await api.post<RecurringPayment>(
        "/recurring-payments",
        input
      )
      await refresh()
      return created
    },
    [refresh]
  )

  const updateRecurringPayment = useCallback(
    async (id: string, input: Partial<RecurringPaymentInput>) => {
      const updated = await api.patch<RecurringPayment>(
        `/recurring-payments/${id}`,
        input
      )
      await refresh()
      return updated
    },
    [refresh]
  )

  const deleteRecurringPayment = useCallback(async (id: string) => {
    await api.delete(`/recurring-payments/${id}`)
    setRecurringPayments((current) =>
      current.filter((recurringPayment) => recurringPayment.id !== id)
    )
  }, [])

  // Executing creates a Transaction and advances the payment's own next due
  // date server-side. This app has no shared/global data cache — every page
  // fetches its own data on mount (see use-accounts/use-transactions) — so
  // there's nothing else to invalidate here: refreshing this hook's list
  // picks up the new `nextPaymentDate`, and Cuentas/Transacciones will show
  // the newly created transaction the next time those pages mount.
  const executeRecurringPayment = useCallback(
    async (id: string, date?: string) => {
      const result = await api.post<ExecuteRecurringPaymentResult>(
        `/recurring-payments/${id}/execute`,
        date ? { date } : {}
      )
      await refresh()
      return result
    },
    [refresh]
  )

  return {
    recurringPayments,
    isLoading,
    error,
    refresh,
    createRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    executeRecurringPayment,
  }
}
