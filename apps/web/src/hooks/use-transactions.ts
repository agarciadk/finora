import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Transaction, TransactionType } from "@/lib/types"

export type TransactionInput = {
  description: string
  amount: number
  type: TransactionType
  date: string
  accountId: string
  categoryId: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Transaction[]>("/transactions")
      setTransactions(data)
    } catch {
      setError("transactions.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createTransaction = useCallback(async (input: TransactionInput) => {
    const created = await api.post<Transaction>("/transactions", input)
    setTransactions((current) => [created, ...current])
    return created
  }, [])

  const updateTransaction = useCallback(
    async (id: string, input: Partial<TransactionInput>) => {
      const updated = await api.patch<Transaction>(`/transactions/${id}`, input)
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id ? updated : transaction
        )
      )
      return updated
    },
    []
  )

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(`/transactions/${id}`)
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    )
  }, [])

  return {
    transactions,
    isLoading,
    error,
    refresh,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
