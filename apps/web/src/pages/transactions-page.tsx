import { useMemo, useState, type FormEvent } from "react"
import { MoreVertical, Plus, Upload } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ImportTransactionsDialog } from "@/components/import-transactions-dialog"
import { TransactionCategorySelect } from "@/components/transaction-category-select"
import { TransactionsPagination } from "@/components/transactions-pagination"
import {
  TransactionsDateRangeFilter,
  type DateRange,
} from "@/components/transactions-date-range-filter"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import {
  useTransactions,
  type TransactionInput,
} from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"
import type { Transaction, TransactionType } from "@/lib/types"

const TRANSACTION_TYPES: TransactionType[] = ["EXPENSE", "INCOME"]
const PAGE_LIMIT_OPTIONS = [10, 20, 50] as const
const EMPTY_DATE_RANGE: DateRange = { startDate: "", endDate: "" }

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    date: todayIsoDate(),
    accountId: "",
    categoryId: "",
  }
}

export function TransactionsPage() {
  const { t, i18n } = useTranslation()
  const { accounts, refresh: refreshAccounts } = useAccounts()
  const { categories, createCategory } = useCategories()
  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<(typeof PAGE_LIMIT_OPTIONS)[number]>(10)
  const {
    transactions,
    meta,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateTransactionCategory,
    refresh: refreshTransactions,
  } = useTransactions({
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    page,
    limit,
  })

  const [sheetOpen, setSheetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importKey, setImportKey] = useState(0)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null)

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  )

  function openCreateSheet() {
    setEditingTransaction(null)
    setForm(emptyForm())
    setFormError(null)
    setSheetOpen(true)
  }

  function openEditSheet(transaction: Transaction) {
    setEditingTransaction(transaction)
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.slice(0, 10),
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
    })
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: TransactionInput = {
      description: form.description.trim(),
      amount: Number(form.amount),
      type: form.type,
      date: form.date,
      accountId: form.accountId,
      categoryId: form.categoryId,
    }

    if (
      !input.description ||
      !(input.amount > 0) ||
      !input.accountId ||
      !input.categoryId
    ) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, input)
      } else {
        await createTransaction(input)
      }
      setSheetOpen(false)
    } catch {
      setFormError(t("transactions.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTransaction) return

    try {
      await deleteTransaction(deletingTransaction.id)
    } finally {
      setDeletingTransaction(null)
    }
  }

  function handleDateRangeApply(range: DateRange) {
    setDateRange(range)
    setPage(1)
  }

  function handleDateRangeClear() {
    setDateRange(EMPTY_DATE_RANGE)
    setPage(1)
  }

  function handleLimitChange(value: string | null) {
    if (!value) return
    setLimit(Number(value) as (typeof PAGE_LIMIT_OPTIONS)[number])
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {t("transactions.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("transactions.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setImportKey((key) => key + 1)
              setImportOpen(true)
            }}
            disabled={accounts.length === 0}
          >
            <Upload />
            {t("transactions.import.button")}
          </Button>
          <Button onClick={openCreateSheet} disabled={accounts.length === 0}>
            <Plus />
            {t("transactions.addButton")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("transactions.recentTitle")}</CardTitle>
              <CardDescription>
                {t("transactions.recentDescription", {
                  count: meta.total,
                })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TransactionsDateRangeFilter
                value={dateRange}
                onApply={handleDateRangeApply}
                onClear={handleDateRangeClear}
              />
              <Select
                value={String(limit)}
                onValueChange={handleLimitChange}
                items={Object.fromEntries(
                  PAGE_LIMIT_OPTIONS.map((option) => [
                    String(option),
                    t("transactions.filters.perPage", { count: option }),
                  ])
                )}
              >
                <SelectTrigger
                  aria-label={t("transactions.filters.limitLabel")}
                  className="h-9 w-auto min-w-28"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {t("transactions.filters.perPage", { count: option })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("transactions.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("transactions.table.date")}</TableHead>
                  <TableHead>{t("transactions.table.description")}</TableHead>
                  <TableHead>{t("transactions.table.category")}</TableHead>
                  <TableHead>{t("transactions.table.account")}</TableHead>
                  <TableHead className="text-right">
                    {t("transactions.table.amount")}
                  </TableHead>
                  <TableHead className="w-9" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString(
                        i18n.language
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <TransactionCategorySelect
                        transaction={transaction}
                        categories={categories}
                        onChangeCategory={(categoryId) =>
                          updateTransactionCategory(transaction.id, categoryId)
                        }
                        onCreateCategory={(name) =>
                          createCategory({ name, type: transaction.type })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.account.name}
                    </TableCell>
                    <TableCell
                      className={
                        "text-right font-medium " +
                        (transaction.type === "INCOME"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-foreground")
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditSheet(transaction)}
                          >
                            {t("common.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingTransaction(transaction)}
                          >
                            {t("common.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {transactions.length > 0 && (
          <CardFooter>
            <TransactionsPagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </CardFooter>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>
                {editingTransaction
                  ? t("transactions.form.editTitle")
                  : t("transactions.form.createTitle")}
              </SheetTitle>
              <SheetDescription>
                {t("transactions.form.description")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-description">
                  {t("transactions.form.descriptionLabel")}
                </Label>
                <Input
                  id="transaction-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-type">
                  {t("transactions.form.typeLabel")}
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as TransactionType,
                      categoryId: "",
                    }))
                  }
                  items={Object.fromEntries(
                    TRANSACTION_TYPES.map((type) => [
                      type,
                      t(`transactions.types.${type}`),
                    ])
                  )}
                >
                  <SelectTrigger id="transaction-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`transactions.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-amount">
                  {t("transactions.form.amountLabel")}
                </Label>
                <Input
                  id="transaction-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-date">
                  {t("transactions.form.dateLabel")}
                </Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-account">
                  {t("transactions.form.accountLabel")}
                </Label>
                <Select
                  value={form.accountId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      accountId: value as string,
                    }))
                  }
                  items={Object.fromEntries(
                    accounts.map((account) => [account.id, account.name])
                  )}
                >
                  <SelectTrigger id="transaction-account">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="transaction-category">
                  {t("transactions.form.categoryLabel")}
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: value as string,
                    }))
                  }
                  items={Object.fromEntries(
                    availableCategories.map((category) => [
                      category.id,
                      category.name,
                    ])
                  )}
                >
                  <SelectTrigger id="transaction-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? t("common.actions.saving")
                  : t("common.actions.save")}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deletingTransaction !== null}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                name: deletingTransaction?.description,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("common.confirmDelete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportTransactionsDialog
        key={importKey}
        open={importOpen}
        onOpenChange={setImportOpen}
        accounts={accounts}
        categories={categories}
        onImported={() => {
          void refreshTransactions()
          void refreshAccounts()
        }}
      />
    </div>
  )
}
