import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Landmark,
  PiggyBank as PiggyBankIcon,
  TrendingUp,
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransactionCategorySelect } from "@/components/transaction-category-select"
import { TransactionsBulkActionsBar } from "@/components/transactions-bulk-actions-bar"
import { TransactionsPagination } from "@/components/transactions-pagination"
import { TransactionsSearchInput } from "@/components/transactions-search-input"
import {
  TransactionsDateRangeFilter,
  type DateRange,
} from "@/components/transactions-date-range-filter"
import { useAccountDetail } from "@/hooks/use-account-detail"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"
import type { AccountType } from "@/lib/types"

const ACCOUNT_ICONS: Record<AccountType, typeof Landmark> = {
  CHECKING: Landmark,
  SAVINGS: PiggyBankIcon,
  CREDIT_CARD: Wallet,
  CASH: Wallet,
}

const EMPTY_DATE_RANGE: DateRange = { startDate: "", endDate: "" }
const SEARCH_DEBOUNCE_MS = 400

export function AccountDetailPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const accountId = id ?? ""

  const { account, isLoading, error } = useAccountDetail(accountId)
  const { accounts } = useAccounts()
  const { categories, createCategory } = useCategories()

  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_DATE_RANGE)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const {
    transactions,
    meta,
    updateTransactionCategory,
    bulkUpdateCategory,
    bulkUpdateAccount,
    bulkDeleteTransactions,
  } = useTransactions({
    accountIds: accountId ? [accountId] : undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    search: search || undefined,
    page,
    limit: 10,
  })

  // See `transactions-page.tsx` for why this compares by value against a ref
  // instead of a "did I run already" flag (React 18 StrictMode double-invokes
  // effects on mount, which would otherwise still fire the reset once).
  const previousSearchInput = useRef(searchInput)

  useEffect(() => {
    if (previousSearchInput.current === searchInput) return
    previousSearchInput.current = searchInput

    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
      setSelectedIds(new Set())
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchInput])

  const selectedIdsList = useMemo(() => [...selectedIds], [selectedIds])
  const isAllSelected =
    transactions.length > 0 &&
    transactions.every((transaction) => selectedIds.has(transaction.id))

  function handleDateRangeApply(range: DateRange) {
    setDateRange(range)
    setPage(1)
    setSelectedIds(new Set())
  }

  function handleDateRangeClear() {
    setDateRange(EMPTY_DATE_RANGE)
    setPage(1)
    setSelectedIds(new Set())
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
    setSelectedIds(new Set())
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      for (const transaction of transactions) {
        if (checked) {
          next.add(transaction.id)
        } else {
          next.delete(transaction.id)
        }
      }
      return next
    })
  }

  function toggleSelectRow(rowId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(rowId)
      } else {
        next.delete(rowId)
      }
      return next
    })
  }

  async function handleBulkChangeCategory(categoryId: string) {
    await bulkUpdateCategory(selectedIdsList, categoryId)
    setSelectedIds(new Set())
  }

  async function handleBulkChangeAccount(nextAccountId: string) {
    await bulkUpdateAccount(selectedIdsList, nextAccountId)
    setSelectedIds(new Set())
  }

  async function handleBulkDelete() {
    await bulkDeleteTransactions(selectedIdsList)
    setSelectedIds(new Set())
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
  }

  if (error || !account) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {t("accounts.detail.notFound")}
        </p>
        <Button variant="outline" onClick={() => navigate("/patrimonio")}>
          <ArrowLeft />
          {t("accounts.detail.backButton")}
        </Button>
      </div>
    )
  }

  const Icon = ACCOUNT_ICONS[account.type]
  const isInterestBearing = account.interestRate !== null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/patrimonio" />}>
          <ArrowLeft />
          {t("accounts.detail.backButton")}
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">
                {account.name}
              </h1>
              <Badge variant="secondary">
                {t(`accounts.types.${account.type}`)}
              </Badge>
              {isInterestBearing && (
                <Badge variant="outline">
                  <TrendingUp className="size-3" />
                  {t("accounts.interestBadge", { rate: account.interestRate })}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{account.bank}</p>
          </div>
        </div>
        <p className="font-heading text-3xl font-semibold">
          {formatCurrency(account.balance)}
        </p>
      </div>

      {isInterestBearing && (
        <Card>
          <CardHeader>
            <CardTitle>{t("accounts.detail.interestCard.title")}</CardTitle>
            <CardDescription>
              {t("accounts.detail.interestCard.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {t("accounts.detail.interestCard.tae")}
              </p>
              <p className="text-xl font-semibold">{account.interestRate}%</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {t("accounts.detail.interestCard.taxRate")}
              </p>
              <p className="text-xl font-semibold">
                {account.taxRate ?? 0}%
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {t("accounts.detail.interestCard.averageBalance")}
              </p>
              <p className="text-xl font-semibold">
                {formatCurrency(account.stats.averageBalanceLast30Days)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {t("accounts.detail.interestCard.projectedPayment")}
              </p>
              <p className="text-xl font-semibold">
                {account.stats.projectedNextInterestPayment !== null
                  ? formatCurrency(account.stats.projectedNextInterestPayment)
                  : "—"}
              </p>
              {account.stats.nextInterestPaymentDate && (
                <p className="text-sm text-muted-foreground">
                  {t("accounts.detail.interestCard.nextPaymentDate", {
                    date: new Date(
                      account.stats.nextInterestPaymentDate
                    ).toLocaleDateString(i18n.language, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }),
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("accounts.detail.transactionsTitle")}</CardTitle>
              <CardDescription>
                {t("transactions.recentDescription", { count: meta.total })}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TransactionsSearchInput
                value={searchInput}
                onChange={setSearchInput}
              />
              <TransactionsDateRangeFilter
                value={dateRange}
                onApply={handleDateRangeApply}
                onClear={handleDateRangeClear}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {selectedIds.size > 0 && (
            <TransactionsBulkActionsBar
              selectedCount={selectedIds.size}
              categories={categories}
              accounts={accounts}
              onChangeCategory={handleBulkChangeCategory}
              onChangeAccount={handleBulkChangeAccount}
              onDelete={handleBulkDelete}
              onClearSelection={() => setSelectedIds(new Set())}
              hideAccountAction
            />
          )}
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("transactions.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-9">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label={t("transactions.bulk.selectAll")}
                    />
                  </TableHead>
                  <TableHead>{t("transactions.table.date")}</TableHead>
                  <TableHead>{t("transactions.table.description")}</TableHead>
                  <TableHead>{t("transactions.table.category")}</TableHead>
                  <TableHead className="text-right">
                    {t("transactions.table.amount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(transaction.id)}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(transaction.id, checked)
                        }
                        aria-label={t("transactions.bulk.selectRow")}
                      />
                    </TableCell>
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
                    <TableCell
                      className={
                        transaction.type === "INCOME"
                          ? "text-right font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-right font-medium text-destructive"
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <TransactionsPagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
