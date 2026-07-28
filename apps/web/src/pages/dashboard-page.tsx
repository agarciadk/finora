import { useTranslation } from "react-i18next"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const summaryCards = [
  {
    key: "totalBalance",
    value: "€12.480,32",
  },
  {
    key: "monthlyIncome",
    value: "€3.250,00",
  },
  {
    key: "monthlyExpenses",
    value: "€1.940,15",
  },
  {
    key: "savings",
    value: "€1.309,85",
  },
] as const

export function DashboardPage() {
  const { t } = useTranslation()

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
              <CardDescription>
                {t(`dashboard.cards.${card.key}.description`)}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
