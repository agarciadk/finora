import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Account, AccountType } from "@/lib/types"

export type AccountInput = {
  name: string
  bank: string
  type: AccountType
  balance: number
  currency?: string
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Account[]>("/accounts")
      setAccounts(data)
    } catch {
      setError("accounts.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createAccount = useCallback(async (input: AccountInput) => {
    const created = await api.post<Account>("/accounts", input)
    setAccounts((current) => [...current, created])
    return created
  }, [])

  const updateAccount = useCallback(
    async (id: string, input: Partial<AccountInput>) => {
      const updated = await api.patch<Account>(`/accounts/${id}`, input)
      setAccounts((current) =>
        current.map((account) => (account.id === id ? updated : account))
      )
      return updated
    },
    []
  )

  const deleteAccount = useCallback(async (id: string) => {
    await api.delete(`/accounts/${id}`)
    setAccounts((current) => current.filter((account) => account.id !== id))
  }, [])

  return {
    accounts,
    isLoading,
    error,
    refresh,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}
