import { TrendingDown, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AnalyticsCategoryChart } from "@/components/analytics/analytics-category-chart"
import { AnalyticsEvolutionChart } from "@/components/analytics/analytics-evolution-chart"
import { AnalyticsMonthSelector } from "@/components/analytics/analytics-month-selector"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAnalytics } from "@/hooks/use-analytics"
import { formatCurrency } from "@/lib/utils"

export function AnalyticsPage() {
  const { t } = useTranslation()
  const {
    analytics,
    evolution,
    month,
    year,
    isCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useAnalytics()

  const monthlyStats = [
    {
      key: "income" as const,
      value: formatCurrency(analytics?.income ?? 0),
      trend: analytics?.incomeTrend ?? null,
    },
    {
      key: "expenses" as const,
      value: formatCurrency(analytics?.expenses ?? 0),
      trend: analytics?.expensesTrend ?? null,
    },
    {
      key: "savingsRate" as const,
      value: `${analytics?.savingsRate ?? 0}%`,
      trend: analytics?.savingsRateTrend ?? null,
    },
  ]

  const spendingByCategory = analytics?.spendingByCategory ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {t("analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("analytics.description")}
          </p>
        </div>
        <AnalyticsMonthSelector
          month={month}
          year={year}
          isCurrentMonth={isCurrentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCurrentMonth={goToCurrentMonth}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {monthlyStats.map((stat) => (
          <Card key={stat.key}>
            <CardHeader>
              <CardDescription>{t(`analytics.stats.${stat.key}`)}</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                {stat.trend !== null && (
                  <span
                    className={
                      "flex items-center gap-1 text-sm font-medium " +
                      (stat.trend >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive")
                    }
                  >
                    {stat.trend >= 0 ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                    {stat.trend >= 0 ? "+" : ""}
                    {stat.trend}%
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.evolutionTitle")}</CardTitle>
          <CardDescription>{t("analytics.evolutionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsEvolutionChart data={evolution} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.byCategoryTitle")}</CardTitle>
            <CardDescription>
              {t("analytics.byCategoryDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsCategoryChart data={spendingByCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.byCategoryDetailTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {spendingByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("analytics.empty")}
              </p>
            ) : (
              spendingByCategory.map((item) => (
                <div key={item.categoryId} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.amount)} · {item.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    aria-label={t("analytics.categoryProgressLabel", {
                      category: item.category,
                    })}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

