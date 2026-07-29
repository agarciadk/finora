import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Category, TransactionType } from "@/lib/types"

export type CategoryInput = {
  name: string
  type: TransactionType
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<Category[]>("/categories")
      setCategories(data)
    } catch {
      setError("categories.errors.loadFailed")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void refresh()
  }, [refresh])

  const createCategory = useCallback(async (input: CategoryInput) => {
    const created = await api.post<Category>("/categories", input)
    setCategories((current) => [...current, created])
    return created
  }, [])

  const updateCategory = useCallback(
    async (id: string, input: Partial<CategoryInput>) => {
      const updated = await api.patch<Category>(`/categories/${id}`, input)
      setCategories((current) =>
        current.map((category) => (category.id === id ? updated : category))
      )
      return updated
    },
    []
  )

  const deleteCategory = useCallback(async (id: string) => {
    await api.delete(`/categories/${id}`)
    setCategories((current) => current.filter((category) => category.id !== id))
  }, [])

  return {
    categories,
    isLoading,
    error,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
