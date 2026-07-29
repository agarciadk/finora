import { useState, type FormEvent } from "react"
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
import { formatCurrency } from "@/lib/utils"
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
}

export function AccountsPage() {
  const { t } = useTranslation()
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
    }

    if (!input.name || !input.bank || Number.isNaN(input.balance)) {
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
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {t("accounts.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("accounts.description")}
          </p>
        </div>
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
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {t(`accounts.types.${account.type}`)}
                      </Badge>
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
            <div className="flex flex-col gap-4 px-6">
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
