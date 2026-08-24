import { useState, type FormEvent } from "react"
import { Loader2, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category, Transaction } from "@/lib/types"

const CREATE_NEW_VALUE = "__create__"

type TransactionCategorySelectProps = {
  transaction: Transaction
  categories: Category[]
  onChangeCategory: (categoryId: string) => Promise<unknown>
  onCreateCategory: (name: string) => Promise<Category>
}

export function TransactionCategorySelect({
  transaction,
  categories,
  onChangeCategory,
  onCreateCategory,
}: TransactionCategorySelectProps) {
  const { t } = useTranslation()
  const availableCategories = categories.filter(
    (category) => category.type === transaction.type
  )

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function applyCategory(categoryId: string) {
    setIsUpdating(true)
    setUpdateError(null)
    try {
      await onChangeCategory(categoryId)
    } catch {
      setUpdateError(t("transactions.category.errors.updateFailed"))
    } finally {
      setIsUpdating(false)
    }
  }

  function handleValueChange(value: string | null) {
    if (!value || value === CREATE_NEW_VALUE) {
      if (value === CREATE_NEW_VALUE) {
        setNewCategoryName("")
        setCreateError(null)
        setDialogOpen(true)
      }
      return
    }

    if (value === transaction.categoryId) return

    void applyCategory(value)
  }

  async function handleCreateCategory(event: FormEvent) {
    event.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setIsCreating(true)
    setCreateError(null)

    try {
      const created = await onCreateCategory(name)
      setDialogOpen(false)
      await applyCategory(created.id)
    } catch {
      setCreateError(t("transactions.category.errors.createFailed"))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Select
          value={transaction.categoryId}
          onValueChange={(value) => handleValueChange(value)}
          disabled={isUpdating}
          items={Object.fromEntries([
            ...availableCategories.map((category) => [
              category.id,
              category.name,
            ]),
            [CREATE_NEW_VALUE, t("transactions.category.createNew")],
          ])}
        >
          <SelectTrigger
            aria-label={t("transactions.table.category")}
            className="h-8 w-auto min-w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
            <SelectItem value={CREATE_NEW_VALUE}>
              <Plus className="size-3.5" />
              {t("transactions.category.createNew")}
            </SelectItem>
          </SelectContent>
        </Select>
        {isUpdating && (
          <Loader2
            className="size-3.5 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>
      {updateError && (
        <p className="text-xs text-destructive">{updateError}</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateCategory}>
            <DialogHeader>
              <DialogTitle>
                {t("transactions.category.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("transactions.category.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <Label htmlFor="new-category-name">
                {t("transactions.category.nameLabel")}
              </Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                autoFocus
                required
              />
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("common.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating
                  ? t("common.actions.saving")
                  : t("common.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
