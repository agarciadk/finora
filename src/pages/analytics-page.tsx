import { TrendingDown, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const monthlyStats = [
  {
    key: "income",
    value: "€3.250,00",
    trend: "+8%",
    trendDirection: "up" as const,
  },
  {
    key: "expenses",
    value: "€1.940,15",
    trend: "-3%",
    trendDirection: "down" as const,
  },
  {
    key: "savingsRate",
    value: "40%",
    trend: "+5%",
    trendDirection: "up" as const,
  },
] as const

const spendingByCategory = [
  { category: "Vivienda", amount: 750, percentage: 39 },
  { category: "Alimentación", amount: 320, percentage: 16 },
  { category: "Transporte", amount: 145, percentage: 7 },
  { category: "Ocio", amount: 90, percentage: 5 },
  { category: "Salud", amount: 40, percentage: 2 },
]

export function AnalyticsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("analytics.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("analytics.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {monthlyStats.map((stat) => (
          <Card key={stat.key}>
            <CardHeader>
              <CardDescription>{t(`analytics.stats.${stat.key}`)}</CardDescription>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                <span
                  className={
                    "flex items-center gap-1 text-sm font-medium " +
                    (stat.trendDirection === "up"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive")
                  }
                >
                  {stat.trendDirection === "up" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.byCategoryTitle")}</CardTitle>
          <CardDescription>
            {t("analytics.byCategoryDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {spendingByCategory.map((item) => (
            <div key={item.category} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.category}</span>
                <span className="text-muted-foreground">
                  €{item.amount.toLocaleString("es-ES")} · {item.percentage}%
                </span>
              </div>
              <Progress
                value={item.percentage}
                aria-label={t("analytics.categoryProgressLabel", {
                  category: item.category,
                })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
