import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { AuditLog } from "@/lib/types"

export type AuditLogsMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

const DEFAULT_META: AuditLogsMeta = { total: 0, page: 1, limit: 20, totalPages: 0 }

export function useAuditLogs(page: number, limit = 20) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [meta, setMeta] = useState<AuditLogsMeta>(DEFAULT_META)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<{ data: AuditLog[]; meta: AuditLogsMeta }>(
        `/audit-logs?page=${page}&limit=${limit}`
      )
      setAuditLogs(response.data)
      setMeta(response.meta)
    } catch {
      setError("settings.activityLog.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  return { auditLogs, meta, isLoading, error }
}
