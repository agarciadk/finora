import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/types"

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<User>("/users/me")
      setUser(data)
    } catch {
      setError("settings.profile.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const updateUser = useCallback(
    async (input: {
      name?: string
      email?: string
      mainIncomeSource?: string
      payday?: number
    }) => {
      const updated = await api.patch<User>("/users/me", input)
      setUser(updated)
      return updated
    },
    []
  )

  return { user, isLoading, error, refresh, updateUser }
}
