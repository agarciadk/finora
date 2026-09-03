import { useMemo, useState, type FormEvent } from "react"
import { MoreVertical, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
import { useBudgets, type BudgetInput } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { formatCurrency } from "@/lib/utils"
import type { Budget } from "@/lib/types"

const now = new Date()

function emptyForm(month: number, year: number) {
  return { categoryId: "", limit: "", month, year }
}

export function BudgetsTab() {
  const { t } = useTranslation()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const { categories } = useCategories()
  const { budgets, createBudget, updateBudget, deleteBudget } = useBudgets(
    month,
    year
  )

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "EXPENSE"),
    [categories]
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [form, setForm] = useState(() => emptyForm(month, year))
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)

  function openCreateSheet() {
    setEditingBudget(null)
    setForm(emptyForm(month, year))
    setFormError(null)
    setSheetOpen(true)
  }

  function openEditSheet(budget: Budget) {
    setEditingBudget(budget)
    setForm({
      categoryId: budget.categoryId,
      limit: budget.limit,
      month: budget.month,
      year: budget.year,
    })
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: BudgetInput = {
      categoryId: form.categoryId,
      limit: Number(form.limit),
      month: form.month,
      year: form.year,
    }

    if (!input.categoryId || !(input.limit > 0)) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, input)
      } else {
        await createBudget(input)
      }
      setSheetOpen(false)
    } catch {
      setFormError(t("budgets.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingBudget) return

    try {
      await deleteBudget(deletingBudget.id)
    } finally {
      setDeletingBudget(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("budgets.description")}
        </p>
        <Button onClick={openCreateSheet}>
          <Plus />
          {t("budgets.addButton")}
        </Button>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("budgets.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {budgets.map((budget) => {
            const spent = Number(budget.spent ?? 0)
            const limit = Number(budget.limit)
            const percentage = Math.min(Math.round((spent / limit) * 100), 100)
            const isOverBudget = spent >= limit

            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{budget.category.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOverBudget ? "destructive" : "secondary"}
                        className={
                          isOverBudget ? "bg-destructive text-white" : undefined
                        }
                      >
                        {percentage}%
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditSheet(budget)}
                          >
                            {t("common.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingBudget(budget)}
                          >
                            {t("common.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription>
                    {t("budgets.spentOfLimit", {
                      spent: formatCurrency(spent),
                      limit: formatCurrency(limit),
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={percentage}
                    aria-label={t("budgets.progressLabel", {
                      category: budget.category.name,
                    })}
                  />
                </CardContent>
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
                {editingBudget
                  ? t("budgets.form.editTitle")
                  : t("budgets.form.createTitle")}
              </SheetTitle>
              <SheetDescription>
                {t("budgets.form.description")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="budget-category">
                  {t("budgets.form.categoryLabel")}
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: value as string,
                    }))
                  }
                  disabled={Boolean(editingBudget)}
                  items={Object.fromEntries(
                    expenseCategories.map((category) => [
                      category.id,
                      category.name,
                    ])
                  )}
                >
                  <SelectTrigger id="budget-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="budget-limit">
                  {t("budgets.form.limitLabel")}
                </Label>
                <Input
                  id="budget-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.limit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      limit: event.target.value,
                    }))
                  }
                  required
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
        open={deletingBudget !== null}
        onOpenChange={(open) => !open && setDeletingBudget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                name: deletingBudget?.category.name,
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
    </div>
  )
}
