import { useState, type FormEvent } from "react"
import { MoreVertical, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryColorDot } from "@/components/category-color-dot"
import { useCategories, type CategoryInput } from "@/hooks/use-categories"
import { CATEGORY_COLORS } from "@/lib/category-colors"
import type { Category, TransactionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const CATEGORY_TYPES: TransactionType[] = ["EXPENSE", "INCOME"]

const EMPTY_FORM = {
  name: "",
  type: "EXPENSE" as TransactionType,
  color: null as string | null,
}

export function CategoriesTab() {
  const { t } = useTranslation()
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  )
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreateSheet() {
    setEditingCategory(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setSheetOpen(true)
  }

  function openEditSheet(category: Category) {
    setEditingCategory(category)
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
    })
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: CategoryInput = {
      name: form.name.trim(),
      type: form.type,
      color: form.color ?? undefined,
    }

    if (!input.name) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, input)
      } else {
        await createCategory(input)
      }
      setSheetOpen(false)
    } catch {
      setFormError(t("categories.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  function openDeleteDialog(category: Category) {
    setDeleteError(null)
    setDeletingCategory(category)
  }

  async function handleDelete() {
    if (!deletingCategory) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
    } catch {
      setDeleteError(t("categories.errors.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button onClick={openCreateSheet}>
          <Plus />
          {t("categories.addButton")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("categories.title")}</CardTitle>
          <CardDescription>{t("categories.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("categories.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categories.table.name")}</TableHead>
                  <TableHead>{t("categories.table.type")}</TableHead>
                  <TableHead className="w-9">
                    <span className="sr-only">
                      {t("common.actions.actionsMenu")}
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <CategoryColorDot color={category.color} />
                        {category.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          category.type === "INCOME" ? "secondary" : "outline"
                        }
                      >
                        {t(`transactions.types.${category.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={t("common.actions.actionsMenu")}
                            />
                          }
                        >
                          <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditSheet(category)}
                          >
                            {t("common.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDeleteDialog(category)}
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
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>
                {editingCategory
                  ? t("categories.form.editTitle")
                  : t("categories.form.createTitle")}
              </SheetTitle>
              <SheetDescription>
                {t("categories.form.description")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category-name">
                  {t("categories.form.nameLabel")}
                </Label>
                <Input
                  id="category-name"
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
                <Label htmlFor="category-type">
                  {t("categories.form.typeLabel")}
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as TransactionType,
                    }))
                  }
                  items={Object.fromEntries(
                    CATEGORY_TYPES.map((type) => [
                      type,
                      t(`transactions.types.${type}`),
                    ])
                  )}
                >
                  <SelectTrigger id="category-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`transactions.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("categories.form.colorLabel")}</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({ ...current, color: null }))
                    }
                    aria-label={t("categories.form.colorNone")}
                    aria-pressed={form.color === null}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2",
                      form.color === null
                        ? "border-foreground"
                        : "border-transparent"
                    )}
                  >
                    <span className="size-4 rounded-full border border-dashed border-muted-foreground" />
                  </button>
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, color }))
                      }
                      aria-label={color}
                      aria-pressed={form.color === color}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border-2",
                        form.color === color
                          ? "border-foreground"
                          : "border-transparent"
                      )}
                    >
                      <span
                        className="size-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  ))}
                </div>
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
        open={deletingCategory !== null}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("categories.deleteDialog.title", {
                name: deletingCategory?.name,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? t("common.actions.saving")
                : t("common.confirmDelete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
