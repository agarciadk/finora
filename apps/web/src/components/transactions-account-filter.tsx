import { ChevronDown, Landmark } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Account } from "@/lib/types"

type TransactionsAccountFilterProps = {
  accounts: Account[]
  selectedAccountIds: string[]
  onChange: (accountIds: string[]) => void
}

export function TransactionsAccountFilter({
  accounts,
  selectedAccountIds,
  onChange,
}: TransactionsAccountFilterProps) {
  const { t } = useTranslation()

  function toggleAccount(accountId: string, checked: boolean) {
    onChange(
      checked
        ? [...selectedAccountIds, accountId]
        : selectedAccountIds.filter((id) => id !== accountId)
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Landmark />
        {selectedAccountIds.length > 0
          ? t("transactions.filters.accountsSelected", {
              count: selectedAccountIds.length,
            })
          : t("transactions.filters.accountsButton")}
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t("transactions.filters.accountsButton")}
          </DropdownMenuLabel>
          {accounts.map((account) => (
            <DropdownMenuCheckboxItem
              key={account.id}
              checked={selectedAccountIds.includes(account.id)}
              onCheckedChange={(checked) => toggleAccount(account.id, checked)}
            >
              {account.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
