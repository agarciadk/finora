import { useMemo, useState, type FormEvent } from "react"
import { MoreVertical, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import {
  useRecurringPayments,
  type RecurringPaymentInput,
} from "@/hooks/use-recurring-payments"
import { formatCurrency } from "@/lib/utils"
import type {
  RecurringFrequency,
  RecurringPayment,
  TransactionType,
} from "@/lib/types"

const RECURRING_TYPES: TransactionType[] = ["EXPENSE", "INCOME"]
const FREQUENCIES: RecurringFrequency[] = ["WEEKLY", "MONTHLY", "YEARLY"]
const DUE_SOON_DAYS = 3
const MS_PER_DAY = 24 * 60 * 60 * 1000

// Normalizes each frequency to an equivalent monthly amount: weekly uses the
// average number of weeks per month (52/12), not a flat 4, so the total
// stays accurate over a full year.
const MONTHLY_MULTIPLIER: Record<RecurringFrequency, number> = {
  WEEKLY: 52 / 12,
  MONTHLY: 1,
  YEARLY: 1 / 12,
}

type DueStatus = "overdue" | "dueSoon" | "upcoming"

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    accountId: "",
    categoryId: "",
    name: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    frequency: "MONTHLY" as RecurringFrequency,
    startDate: todayIsoDate(),
    isActive: true,
  }
}

function getDueStatus(nextPaymentDate: string): DueStatus {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const dueDate = new Date(nextPaymentDate)
  const diffDays = Math.floor(
    (dueDate.getTime() - today.getTime()) / MS_PER_DAY
  )

  if (diffDays < 0) return "overdue"
  if (diffDays <= DUE_SOON_DAYS) return "dueSoon"
  return "upcoming"
}

export function RecurringPaymentsTab() {
  const { t, i18n } = useTranslation()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const {
    recurringPayments,
    createRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    executeRecurringPayment,
  } = useRecurringPayments()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPayment, setEditingPayment] =
    useState<RecurringPayment | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingPayment, setDeletingPayment] =
    useState<RecurringPayment | null>(null)
  const [executingPayment, setExecutingPayment] =
    useState<RecurringPayment | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executeError, setExecuteError] = useState<string | null>(null)

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  )

  const totalMonthlyExpenses = useMemo(
    () =>
      recurringPayments
        .filter((payment) => payment.isActive && payment.type === "EXPENSE")
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount) * MONTHLY_MULTIPLIER[payment.frequency],
          0
        ),
    [recurringPayments]
  )

  function openCreateSheet() {
    setEditingPayment(null)
    setForm(emptyForm())
    setFormError(null)
    setSheetOpen(true)
  }

  function openEditSheet(payment: RecurringPayment) {
    setEditingPayment(payment)
    setForm({
      accountId: payment.accountId,
      categoryId: payment.categoryId,
      name: payment.name,
      amount: payment.amount,
      type: payment.type,
      frequency: payment.frequency,
      startDate: payment.startDate.slice(0, 10),
      isActive: payment.isActive,
    })
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: RecurringPaymentInput = {
      accountId: form.accountId,
      categoryId: form.categoryId,
      name: form.name,
      amount: Number(form.amount),
      type: form.type,
      frequency: form.frequency,
      startDate: form.startDate,
      isActive: form.isActive,
    }

    if (
      !input.accountId ||
      !input.categoryId ||
      !input.name ||
      !(input.amount > 0) ||
      !input.startDate
    ) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      if (editingPayment) {
        await updateRecurringPayment(editingPayment.id, input)
      } else {
        await createRecurringPayment(input)
      }
      setSheetOpen(false)
    } catch {
      setFormError(t("recurringPayments.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingPayment) return

    try {
      await deleteRecurringPayment(deletingPayment.id)
    } finally {
      setDeletingPayment(null)
    }
  }

  async function handleExecute() {
    if (!executingPayment) return

    setIsExecuting(true)
    setExecuteError(null)

    try {
      await executeRecurringPayment(executingPayment.id)
      setExecutingPayment(null)
    } catch {
      setExecuteError(t("recurringPayments.errors.executeFailed"))
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("recurringPayments.description")}
        </p>
        <Button onClick={openCreateSheet}>
          <Plus />
          {t("recurringPayments.addButton")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recurringPayments.summary.title")}</CardTitle>
          <CardDescription>
            {t("recurringPayments.summary.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatCurrency(totalMonthlyExpenses)}
          </p>
        </CardContent>
      </Card>

      {recurringPayments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("recurringPayments.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recurringPayments.map((payment) => {
            const dueStatus = getDueStatus(payment.nextPaymentDate)

            return (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{payment.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditSheet(payment)}
                        >
                          {t("common.actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingPayment(payment)}
                        >
                          {t("common.actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription
                    className={
                      payment.type === "INCOME"
                        ? "text-emerald-700 dark:text-emerald-400 text-lg font-semibold"
                        : "text-lg font-semibold text-foreground"
                    }
                  >
                    {payment.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(payment.amount)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{payment.category.name}</Badge>
                    <Badge variant="secondary">{payment.account.name}</Badge>
                    <Badge variant="outline">
                      {t(`recurringPayments.frequency.${payment.frequency}`)}
                    </Badge>
                    {!payment.isActive && (
                      <Badge variant="outline">
                        {t("recurringPayments.status.paused")}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={
                      dueStatus === "overdue"
                        ? "text-sm font-medium text-destructive"
                        : dueStatus === "dueSoon"
                          ? "text-sm font-medium text-amber-600 dark:text-amber-400"
                          : "text-sm text-muted-foreground"
                    }
                  >
                    {t("recurringPayments.nextPayment", {
                      date: new Date(
                        payment.nextPaymentDate
                      ).toLocaleDateString(i18n.language, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      }),
                    })}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={!payment.isActive}
                    onClick={() => {
                      setExecuteError(null)
                      setExecutingPayment(payment)
                    }}
                  >
                    {t("recurringPayments.markAsPaid")}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>
                {editingPayment
                  ? t("recurringPayments.form.editTitle")
                  : t("recurringPayments.form.createTitle")}
              </SheetTitle>
              <SheetDescription>
                {t("recurringPayments.form.description")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurring-name">
                  {t("recurringPayments.form.nameLabel")}
                </Label>
                <Input
                  id="recurring-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurring-amount">
                  {t("recurringPayments.form.amountLabel")}
                </Label>
                <Input
                  id="recurring-amount"
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
                <Label htmlFor="recurring-type">
                  {t("recurringPayments.form.typeLabel")}
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
                    RECURRING_TYPES.map((type) => [
                      type,
                      t(`transactions.types.${type}`),
                    ])
                  )}
                >
                  <SelectTrigger id="recurring-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`transactions.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurring-frequency">
                  {t("recurringPayments.form.frequencyLabel")}
                </Label>
                <Select
                  value={form.frequency}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      frequency: value as RecurringFrequency,
                    }))
                  }
                  items={Object.fromEntries(
                    FREQUENCIES.map((frequency) => [
                      frequency,
                      t(`recurringPayments.frequency.${frequency}`),
                    ])
                  )}
                >
                  <SelectTrigger id="recurring-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {t(`recurringPayments.frequency.${frequency}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurring-start-date">
                  {t("recurringPayments.form.startDateLabel")}
                </Label>
                <Input
                  id="recurring-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurring-account">
                  {t("recurringPayments.form.accountLabel")}
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
                  <SelectTrigger id="recurring-account">
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
                <Label htmlFor="recurring-category">
                  {t("recurringPayments.form.categoryLabel")}
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
                  <SelectTrigger id="recurring-category">
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
              <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="recurring-active">
                    {t("recurringPayments.form.activeLabel")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("recurringPayments.form.activeDescription")}
                  </p>
                </div>
                <Switch
                  id="recurring-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, isActive: checked }))
                  }
                />
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
        open={deletingPayment !== null}
        onOpenChange={(open) => !open && setDeletingPayment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                name: deletingPayment?.name,
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

      <AlertDialog
        open={executingPayment !== null}
        onOpenChange={(open) => !open && !isExecuting && setExecutingPayment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("recurringPayments.markAsPaidDialog.title", {
                name: executingPayment?.name,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {executingPayment &&
                t("recurringPayments.markAsPaidDialog.description", {
                  amount: formatCurrency(executingPayment.amount),
                  account: executingPayment.account.name,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {executeError && (
            <p className="text-sm text-destructive">{executeError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>
              {t("common.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleExecute} disabled={isExecuting}>
              {isExecuting
                ? t("common.actions.saving")
                : t("recurringPayments.markAsPaidDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
