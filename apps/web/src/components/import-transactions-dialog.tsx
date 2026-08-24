import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { Loader2, Upload } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useTransactionImport,
  type ImportTransactionInput,
} from "@/hooks/use-transaction-import"
import { cn, formatCurrency } from "@/lib/utils"
import type {
  Account,
  Category,
  ImportConfirmResult,
  ImportPreviewResult,
  ImportRowStatus,
} from "@/lib/types"

const ALLOWED_EXTENSIONS = [".csv", ".xlsx"]
const MAX_PREVIEW_ROWS = 200

type Step = "select" | "preview" | "success"

type ImportTransactionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  categories: Category[]
  onImported: () => void
}

function hasValidExtension(fileName: string) {
  const lower = fileName.toLowerCase()
  return ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

function statusVariantClass(status: ImportRowStatus) {
  if (status === "valid") {
    return "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
  }
  if (status === "duplicate") {
    return "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400"
  }
  return "border-destructive/30 bg-destructive/10 text-destructive"
}

export function ImportTransactionsDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onImported,
}: ImportTransactionsDialogProps) {
  const { t, i18n } = useTranslation()
  const { previewImport, confirmImport, isPreviewing, isConfirming } =
    useTransactionImport()

  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>("select")
  const [accountId, setAccountId] = useState(() => accounts[0]?.id ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [confirmResult, setConfirmResult] = useState<ImportConfirmResult | null>(
    null
  )
  const [incomeCategoryId, setIncomeCategoryId] = useState("")
  const [expenseCategoryId, setExpenseCategoryId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const incomeCategories = categories.filter((c) => c.type === "INCOME")
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")

  function reset() {
    setStep("select")
    setAccountId("")
    setFile(null)
    setPreview(null)
    setConfirmResult(null)
    setIncomeCategoryId("")
    setExpenseCategoryId("")
    setError(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  function pickFile(nextFile: File | null) {
    setError(null)
    if (!nextFile) {
      setFile(null)
      return
    }
    if (!hasValidExtension(nextFile.name)) {
      setFile(null)
      setError(t("transactions.import.errors.invalidExtension"))
      return
    }
    setFile(nextFile)
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    pickFile(event.target.files?.[0] ?? null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    pickFile(event.dataTransfer.files?.[0] ?? null)
  }

  async function handleAnalyze() {
    setError(null)
    if (!accountId) {
      setError(t("transactions.import.errors.noAccount"))
      return
    }
    if (!file) {
      setError(t("transactions.import.errors.noFile"))
      return
    }

    try {
      const result = await previewImport(accountId, file)
      setPreview(result)
      setIncomeCategoryId(incomeCategories[0]?.id ?? "")
      setExpenseCategoryId(expenseCategories[0]?.id ?? "")
      setStep("preview")
    } catch {
      setError(t("transactions.import.errors.previewFailed"))
    }
  }

  async function handleConfirm() {
    if (!preview) return
    setError(null)

    const validRows = preview.transactions.filter((row) => row.status === "valid")
    const missingCategory = validRows.some((row) =>
      row.amount?.startsWith("-") ? !expenseCategoryId : !incomeCategoryId
    )
    if (missingCategory) {
      setError(t("transactions.import.errors.missingCategory"))
      return
    }

    const payload: ImportTransactionInput[] = validRows.map((row) => ({
      date: row.date!,
      description: row.description,
      amount: row.amount!,
      balance: row.balance ?? undefined,
      categoryId: row.amount?.startsWith("-")
        ? expenseCategoryId
        : incomeCategoryId,
    }))

    try {
      const result = await confirmImport(accountId, payload)
      setConfirmResult(result)
      setStep("success")
      onImported()
    } catch {
      setError(t("transactions.import.errors.confirmFailed"))
    }
  }

  const validRowCount =
    preview?.transactions.filter((row) => row.status === "valid").length ?? 0

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="data-[side=right]:sm:max-w-2xl">
        <div className="flex h-full flex-col overflow-hidden">
          <SheetHeader>
            <SheetTitle>{t("transactions.import.dialogTitle")}</SheetTitle>
            <SheetDescription>
              {t("transactions.import.dialogDescription")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
            {step === "select" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="import-account">
                    {t("transactions.import.accountLabel")}
                  </Label>
                  <Select
                    value={accountId}
                    onValueChange={(value) => setAccountId(value as string)}
                    items={Object.fromEntries(
                      accounts.map((account) => [account.id, account.name])
                    )}
                  >
                    <SelectTrigger id="import-account">
                      <SelectValue
                        placeholder={t(
                          "transactions.import.accountPlaceholder"
                        )}
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
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={fileInputId}>
                    {t("transactions.import.fileLabel")}
                  </Label>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDraggingOver(true)
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center transition-colors",
                      isDraggingOver && "border-primary bg-muted"
                    )}
                  >
                    <Upload className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t("transactions.import.dropHint")}
                    </p>
                    <input
                      ref={fileInputRef}
                      id={fileInputId}
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileInputChange}
                      className="text-sm"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      {t("transactions.import.selectedFile", {
                        name: file.name,
                      })}
                    </p>
                  )}
                </div>

                {isPreviewing && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="size-4 animate-spin" />
                    {t("transactions.import.analyzing")}
                  </p>
                )}
              </>
            )}

            {step === "preview" && preview && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.import.summary.total")}
                    </p>
                    <p className="text-lg font-semibold">
                      {preview.totalRows}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.import.summary.valid")}
                    </p>
                    <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                      {preview.validRows}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.import.summary.duplicate")}
                    </p>
                    <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                      {preview.duplicateRows}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.import.summary.invalid")}
                    </p>
                    <p className="text-lg font-semibold text-destructive">
                      {preview.invalidRows}
                    </p>
                  </div>
                </div>

                {preview.dateRange && (
                  <p className="text-sm text-muted-foreground">
                    {t("transactions.import.summary.dateRange", {
                      from: new Date(preview.dateRange.from).toLocaleDateString(
                        i18n.language
                      ),
                      to: new Date(preview.dateRange.to).toLocaleDateString(
                        i18n.language
                      ),
                    })}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="import-income-category">
                      {t("transactions.import.incomeCategoryLabel")}
                    </Label>
                    <Select
                      value={incomeCategoryId}
                      onValueChange={(value) =>
                        setIncomeCategoryId(value as string)
                      }
                      items={Object.fromEntries(
                        incomeCategories.map((category) => [
                          category.id,
                          category.name,
                        ])
                      )}
                    >
                      <SelectTrigger id="import-income-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="import-expense-category">
                      {t("transactions.import.expenseCategoryLabel")}
                    </Label>
                    <Select
                      value={expenseCategoryId}
                      onValueChange={(value) =>
                        setExpenseCategoryId(value as string)
                      }
                      items={Object.fromEntries(
                        expenseCategories.map((category) => [
                          category.id,
                          category.name,
                        ])
                      )}
                    >
                      <SelectTrigger id="import-expense-category">
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
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("transactions.import.table.date")}</TableHead>
                      <TableHead>
                        {t("transactions.import.table.description")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("transactions.import.table.amount")}
                      </TableHead>
                      <TableHead>
                        {t("transactions.import.table.status")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.transactions.slice(0, MAX_PREVIEW_ROWS).map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="text-muted-foreground">
                          {row.date
                            ? new Date(row.date).toLocaleDateString(
                                i18n.language
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.amount ? formatCurrency(row.amount) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusVariantClass(row.status)}
                          >
                            {t(`transactions.import.status.${row.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {step === "success" && confirmResult && (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-4"
              >
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {t("transactions.import.successTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("transactions.import.successMessage", {
                    count: confirmResult.imported,
                  })}
                </p>
                {confirmResult.duplicates > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t("transactions.import.successDuplicates", {
                      count: confirmResult.duplicates,
                    })}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <SheetFooter className="flex-row justify-end">
            {step === "select" && (
              <>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  {t("transactions.import.cancelButton")}
                </Button>
                <Button onClick={() => void handleAnalyze()} disabled={isPreviewing}>
                  {isPreviewing
                    ? t("transactions.import.analyzing")
                    : t("transactions.import.analyzeButton")}
                </Button>
              </>
            )}
            {step === "preview" && (
              <>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  {t("transactions.import.cancelButton")}
                </Button>
                <Button
                  onClick={() => void handleConfirm()}
                  disabled={isConfirming || validRowCount === 0}
                >
                  {isConfirming
                    ? t("transactions.import.confirming")
                    : t("transactions.import.confirmButton", {
                        count: validRowCount,
                      })}
                </Button>
              </>
            )}
            {step === "success" && (
              <Button onClick={() => handleOpenChange(false)}>
                {t("transactions.import.closeButton")}
              </Button>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
