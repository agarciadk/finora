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

export type TransactionsQuery = {
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export type TransactionsMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

const DEFAULT_META: TransactionsMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

function buildQueryString(query: Required<TransactionsQuery>) {
  const params = new URLSearchParams()

  if (query.startDate) params.set("startDate", query.startDate)
  if (query.endDate) params.set("endDate", query.endDate)
  params.set("page", String(query.page))
  params.set("limit", String(query.limit))

  return params.toString()
}

export function useTransactions(query: TransactionsQuery = {}) {
  const { startDate = "", endDate = "", page = 1, limit = 10 } = query
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [meta, setMeta] = useState<TransactionsMeta>(DEFAULT_META)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<{
        data: Transaction[]
        meta: TransactionsMeta
      }>(`/transactions?${buildQueryString({ startDate, endDate, page, limit })}`)
      setTransactions(response.data)
      setMeta(response.meta)
    } catch {
      setError("transactions.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createTransaction = useCallback(
    async (input: TransactionInput) => {
      const created = await api.post<Transaction>("/transactions", input)
      await refresh()
      return created
    },
    [refresh]
  )

  const updateTransaction = useCallback(
    async (id: string, input: Partial<TransactionInput>) => {
      const updated = await api.patch<Transaction>(`/transactions/${id}`, input)
      await refresh()
      return updated
    },
    [refresh]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      await api.delete(`/transactions/${id}`)
      await refresh()
    },
    [refresh]
  )

  const updateTransactionCategory = useCallback(
    async (id: string, categoryId: string) => {
      const updated = await api.patch<Transaction>(
        `/transactions/${id}/category`,
        { categoryId }
      )
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id ? updated : transaction
        )
      )
      return updated
    },
    []
  )

  return {
    transactions,
    meta,
    isLoading,
    error,
    refresh,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateTransactionCategory,
  }
}
