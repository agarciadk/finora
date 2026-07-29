import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { NotificationPreference, NotificationPreferenceType } from "@/lib/types"

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<NotificationPreference[]>(
        "/notification-preferences"
      )
      setPreferences(data)
    } catch {
      setError("settings.notifications.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const setPreference = useCallback(
    async (type: NotificationPreferenceType, enabled: boolean) => {
      const updated = await api.patch<NotificationPreference>(
        `/notification-preferences/${type}`,
        { enabled }
      )
      setPreferences((current) => {
        const exists = current.some((preference) => preference.type === type)
        return exists
          ? current.map((preference) =>
              preference.type === type ? updated : preference
            )
          : [...current, updated]
      })
      return updated
    },
    []
  )

  return { preferences, isLoading, error, refresh, setPreference }
}
