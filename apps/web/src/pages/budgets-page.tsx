import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const budgets = [
  {
    category: "Alimentación",
    spent: 320,
    limit: 400,
  },
  {
    category: "Transporte",
    spent: 145,
    limit: 150,
  },
  {
    category: "Ocio",
    spent: 90,
    limit: 200,
  },
  {
    category: "Vivienda",
    spent: 750,
    limit: 750,
  },
  {
    category: "Salud",
    spent: 40,
    limit: 120,
  },
]

function formatEuros(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

export function BudgetsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("budgets.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("budgets.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {budgets.map((budget) => {
          const percentage = Math.min(
            Math.round((budget.spent / budget.limit) * 100),
            100
          )
          const isOverBudget = budget.spent >= budget.limit

          return (
            <Card key={budget.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{budget.category}</CardTitle>
                  <Badge
                    variant={isOverBudget ? "destructive" : "secondary"}
                    className={isOverBudget ? "bg-destructive text-white" : undefined}
                  >
                    {percentage}%
                  </Badge>
                </div>
                <CardDescription>
                  {t("budgets.spentOfLimit", {
                    spent: formatEuros(budget.spent),
                    limit: formatEuros(budget.limit),
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={percentage}
                  aria-label={t("budgets.progressLabel", {
                    category: budget.category,
                  })}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
