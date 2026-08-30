import { useTranslation } from "react-i18next"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-accounts"
import { useAnalytics } from "@/hooks/use-analytics"
import { formatCurrency } from "@/lib/utils"

function formatTrend(trend: number | null) {
  if (trend === null) return null
  return `${trend >= 0 ? "+" : ""}${trend}%`
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { accounts } = useAccounts()
  const { analytics } = useAnalytics()

  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0
  )
  const monthlyIncome = analytics?.income ?? 0
  const monthlyExpenses = analytics?.expenses ?? 0
  const savings = monthlyIncome - monthlyExpenses
  const savingsRate = analytics?.savingsRate ?? 0
  const incomeTrend = formatTrend(analytics?.incomeTrend ?? null)
  const expensesTrend = formatTrend(analytics?.expensesTrend ?? null)

  const summaryCards = [
    {
      key: "totalBalance" as const,
      value: formatCurrency(totalBalance),
      description: t("dashboard.cards.totalBalance.description"),
    },
    {
      key: "monthlyIncome" as const,
      value: formatCurrency(monthlyIncome),
      description: incomeTrend
        ? t("dashboard.cards.monthlyIncome.description", { trend: incomeTrend })
        : t("dashboard.cards.monthlyIncome.noTrend"),
    },
    {
      key: "monthlyExpenses" as const,
      value: formatCurrency(monthlyExpenses),
      description: expensesTrend
        ? t("dashboard.cards.monthlyExpenses.description", {
            trend: expensesTrend,
          })
        : t("dashboard.cards.monthlyExpenses.noTrend"),
    },
    {
      key: "savings" as const,
      value: formatCurrency(savings),
      description: t("dashboard.cards.savings.description", {
        rate: savingsRate,
      }),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.description")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardDescription>
                {t(`dashboard.cards.${card.key}.title`)}
              </CardDescription>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
