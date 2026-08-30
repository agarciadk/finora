import { useState } from "react"
import { Landmark, Loader2, Tags, Trash2, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Account, Category } from "@/lib/types"

type TransactionsBulkActionsBarProps = {
  selectedCount: number
  categories: Category[]
  accounts: Account[]
  onChangeCategory: (categoryId: string) => Promise<unknown>
  onChangeAccount: (accountId: string) => Promise<unknown>
  onDelete: () => Promise<unknown>
  onClearSelection: () => void
  // Hidden when the table is already locked to a single account (e.g. the
  // account detail page), where reassigning to another account makes no sense.
  hideAccountAction?: boolean
}

export function TransactionsBulkActionsBar({
  selectedCount,
  categories,
  accounts,
  onChangeCategory,
  onChangeAccount,
  onDelete,
  onClearSelection,
  hideAccountAction = false,
}: TransactionsBulkActionsBarProps) {
  const { t } = useTranslation()
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [isCategorySaving, setIsCategorySaving] = useState(false)
  const [isAccountSaving, setIsAccountSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmCategory() {
    if (!selectedCategoryId) return
    setIsCategorySaving(true)
    setError(null)
    try {
      await onChangeCategory(selectedCategoryId)
      setCategoryDialogOpen(false)
    } catch {
      setError(t("transactions.bulk.errors.categoryFailed"))
    } finally {
      setIsCategorySaving(false)
    }
  }

  async function handleConfirmAccount() {
    if (!selectedAccountId) return
    setIsAccountSaving(true)
    setError(null)
    try {
      await onChangeAccount(selectedAccountId)
      setAccountDialogOpen(false)
    } catch {
      setError(t("transactions.bulk.errors.accountFailed"))
    } finally {
      setIsAccountSaving(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setError(null)
    try {
      await onDelete()
      setDeleteDialogOpen(false)
    } catch {
      setError(t("transactions.bulk.errors.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClearSelection}
          aria-label={t("transactions.bulk.clearSelection")}
        >
          <X />
        </Button>
        <p className="text-sm font-medium">
          {t("transactions.bulk.selectedCount", { count: selectedCount })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCategoryId("")
            setError(null)
            setCategoryDialogOpen(true)
          }}
        >
          <Tags />
          {t("transactions.bulk.changeCategory")}
        </Button>
        {!hideAccountAction && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAccountId("")
              setError(null)
              setAccountDialogOpen(true)
            }}
          >
            <Landmark />
            {t("transactions.bulk.changeAccount")}
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => {
            setError(null)
            setDeleteDialogOpen(true)
          }}
        >
          <Trash2 />
          {t("transactions.bulk.deleteSelected")}
        </Button>
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("transactions.bulk.changeCategoryTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("transactions.bulk.changeCategoryDescription", {
                count: selectedCount,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setSelectedCategoryId(value ?? "")}
              items={Object.fromEntries(
                categories.map((category) => [
                  category.id,
                  `${category.name} (${t(`transactions.types.${category.type}`)})`,
                ])
              )}
            >
              <SelectTrigger aria-label={t("transactions.form.categoryLabel")}>
                <SelectValue
                  placeholder={t("transactions.form.categoryLabel")}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({t(`transactions.types.${category.type}`)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryDialogOpen(false)}
            >
              {t("common.actions.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirmCategory()}
              disabled={!selectedCategoryId || isCategorySaving}
            >
              {isCategorySaving && <Loader2 className="animate-spin" />}
              {t("common.actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!hideAccountAction && (
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("transactions.bulk.changeAccountTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("transactions.bulk.changeAccountDescription", {
                  count: selectedCount,
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-2">
              <Select
                value={selectedAccountId}
                onValueChange={(value) => setSelectedAccountId(value ?? "")}
                items={Object.fromEntries(
                  accounts.map((account) => [account.id, account.name])
                )}
              >
                <SelectTrigger
                  aria-label={t("transactions.form.accountLabel")}
                >
                  <SelectValue
                    placeholder={t("transactions.form.accountLabel")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccountDialogOpen(false)}
              >
                {t("common.actions.cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmAccount()}
                disabled={!selectedAccountId || isAccountSaving}
              >
                {isAccountSaving && <Loader2 className="animate-spin" />}
                {t("common.actions.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("transactions.bulk.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("transactions.bulk.deleteDescription", {
                count: selectedCount,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="px-6 text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              {t("common.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
