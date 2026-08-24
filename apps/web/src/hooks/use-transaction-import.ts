import { useCallback, useState } from "react"
import { api } from "@/lib/api"
import type { ImportConfirmResult, ImportPreviewResult } from "@/lib/types"

export type ImportTransactionInput = {
  date: string
  description: string
  amount: string
  balance?: string
  categoryId: string
}

export function useTransactionImport() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const previewImport = useCallback(async (accountId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    setIsPreviewing(true)
    try {
      return await api.postForm<ImportPreviewResult>(
        `/accounts/${accountId}/import/preview`,
        formData
      )
    } finally {
      setIsPreviewing(false)
    }
  }, [])

  const confirmImport = useCallback(
    async (accountId: string, transactions: ImportTransactionInput[]) => {
      setIsConfirming(true)
      try {
        return await api.post<ImportConfirmResult>(
          `/accounts/${accountId}/import/confirm`,
          { transactions }
        )
      } finally {
        setIsConfirming(false)
      }
    },
    []
  )

  return { previewImport, confirmImport, isPreviewing, isConfirming }
}
