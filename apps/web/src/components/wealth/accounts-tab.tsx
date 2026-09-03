import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  Landmark,
  MoreVertical,
  PiggyBank as PiggyBankIcon,
  Plus,
  Wallet,
} from "lucide-react"
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
import { useAccounts, type AccountInput } from "@/hooks/use-accounts"
import { formatCurrency, formatIban } from "@/lib/utils"
import type { Account, AccountType } from "@/lib/types"

const ACCOUNT_TYPES: AccountType[] = [
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "CASH",
]

const ACCOUNT_ICONS: Record<AccountType, typeof Landmark> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBankIcon,
  CREDIT_CARD: Wallet,
  CASH: Wallet,
}

const EMPTY_FORM = {
  name: "",
  bank: "",
  type: "CHECKING" as AccountType,
  balance: "",
  iban: "",
  isInterestBearing: false,
  interestRate: "",
  taxRate: "",
  interestPaymentDay: "",
}

export function AccountsTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { accounts, createAccount, updateAccount, deleteAccount } =
    useAccounts()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  function openCreateSheet() {
    setEditingAccount(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setSheetOpen(true)
  }

  function openEditSheet(account: Account) {
    setEditingAccount(account)
    setForm({
      name: account.name,
      bank: account.bank,
      type: account.type,
      balance: account.balance,
      iban: account.iban ?? "",
      isInterestBearing: account.interestRate !== null,
      interestRate: account.interestRate ?? "",
      taxRate: account.taxRate ?? "",
      interestPaymentDay:
        account.interestPaymentDay === null
          ? ""
          : String(account.interestPaymentDay),
    })
    setFormError(null)
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: AccountInput = {
      name: form.name.trim(),
      bank: form.bank.trim(),
      type: form.type,
      balance: Number(form.balance),
      iban: form.iban.trim() || undefined,
      interestRate: form.isInterestBearing ? Number(form.interestRate) : null,
      taxRate: form.isInterestBearing ? Number(form.taxRate) : null,
      interestPaymentDay: form.isInterestBearing
        ? Number(form.interestPaymentDay)
        : null,
    }

    if (
      !input.name ||
      !input.bank ||
      Number.isNaN(input.balance) ||
      (form.isInterestBearing &&
        (Number.isNaN(input.interestRate) ||
          Number.isNaN(input.taxRate) ||
          Number.isNaN(input.interestPaymentDay)))
    ) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, input)
      } else {
        await createAccount(input)
      }
      setSheetOpen(false)
    } catch {
      setFormError(t("accounts.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return

    try {
      await deleteAccount(deletingAccount.id)
    } finally {
      setDeletingAccount(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("accounts.description")}
        </p>
        <Button onClick={openCreateSheet}>
          <Plus />
          {t("accounts.addButton")}
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("accounts.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type]

            return (
              <Card
                key={account.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => navigate(`/patrimonio/cuentas/${account.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    navigate(`/patrimonio/cuentas/${account.id}`)
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-muted-foreground" />
                    <div
                      className="flex items-center gap-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Badge variant="secondary">
                        {t(`accounts.types.${account.type}`)}
                      </Badge>
                      {account.interestRate !== null && (
                        <Badge variant="outline">
                          {t("accounts.interestBadge", {
                            rate: account.interestRate,
                          })}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditSheet(account)}
                          >
                            {t("common.actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingAccount(account)}
                          >
                            {t("common.actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">
                    {formatCurrency(account.balance)}
                  </CardTitle>
                  <CardDescription>{account.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {account.bank}
                  </p>
                  {account.iban && (
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatIban(account.iban)}
                    </p>
                  )}
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
                {editingAccount
                  ? t("accounts.form.editTitle")
                  : t("accounts.form.createTitle")}
              </SheetTitle>
              <SheetDescription>
                {t("accounts.form.description")}
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-name">
                  {t("accounts.form.nameLabel")}
                </Label>
                <Input
                  id="account-name"
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
                <Label htmlFor="account-bank">
                  {t("accounts.form.bankLabel")}
                </Label>
                <Input
                  id="account-bank"
                  value={form.bank}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bank: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-type">
                  {t("accounts.form.typeLabel")}
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as AccountType,
                    }))
                  }
                  items={Object.fromEntries(
                    ACCOUNT_TYPES.map((type) => [
                      type,
                      t(`accounts.types.${type}`),
                    ])
                  )}
                >
                  <SelectTrigger id="account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`accounts.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-balance">
                  {t("accounts.form.balanceLabel")}
                </Label>
                <Input
                  id="account-balance"
                  type="number"
                  step="0.01"
                  value={form.balance}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      balance: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-iban">
                  {t("accounts.form.ibanLabel")}
                </Label>
                <Input
                  id="account-iban"
                  placeholder={t("accounts.form.ibanPlaceholder")}
                  value={form.iban}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      iban: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="account-interest-bearing">
                    {t("accounts.form.interestBearingLabel")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("accounts.form.interestBearingDescription")}
                  </p>
                </div>
                <Switch
                  id="account-interest-bearing"
                  checked={form.isInterestBearing}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isInterestBearing: checked,
                    }))
                  }
                />
              </div>
              {form.isInterestBearing && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="account-interest-rate">
                      {t("accounts.form.interestRateLabel")}
                    </Label>
                    <Input
                      id="account-interest-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={form.interestRate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          interestRate: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="account-tax-rate">
                      {t("accounts.form.taxRateLabel")}
                    </Label>
                    <Input
                      id="account-tax-rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={form.taxRate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          taxRate: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="account-interest-payment-day">
                      {t("accounts.form.interestPaymentDayLabel")}
                    </Label>
                    <Input
                      id="account-interest-payment-day"
                      type="number"
                      step="1"
                      min="1"
                      max="31"
                      value={form.interestPaymentDay}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          interestPaymentDay: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </>
              )}
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
        open={deletingAccount !== null}
        onOpenChange={(open) => !open && setDeletingAccount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                name: deletingAccount?.name,
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
