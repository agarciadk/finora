import { useState } from "react"
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
import { AccountFormSheet } from "@/components/account-form-sheet"
import { useAccounts, type AccountInput } from "@/hooks/use-accounts"
import { formatCurrency } from "@/lib/utils"
import type { Account, AccountType } from "@/lib/types"

const ACCOUNT_ICONS: Record<AccountType, typeof Landmark> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBankIcon,
  CREDIT_CARD: Wallet,
  CASH: Wallet,
}

export function AccountsTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { accounts, createAccount, updateAccount, deleteAccount } =
    useAccounts()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  function openCreateSheet() {
    setEditingAccount(null)
    setSheetOpen(true)
  }

  function openEditSheet(account: Account) {
    setEditingAccount(account)
    setSheetOpen(true)
  }

  async function handleFormSubmit(input: AccountInput): Promise<void> {
    if (editingAccount) {
      await updateAccount(editingAccount.id, input)
    } else {
      await createAccount(input)
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
                      {account.iban}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AccountFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        account={editingAccount}
        onSubmit={handleFormSubmit}
      />

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
