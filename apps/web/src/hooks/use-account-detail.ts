import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AccountDetail } from "@/lib/types"

export function useAccountDetail(id: string) {
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<AccountDetail>(`/accounts/${id}`)
      setAccount(data)
    } catch {
      setError("accounts.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  return { account, isLoading, error, refresh }
}
