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
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Presupuestos</h1>
        <p className="text-sm text-muted-foreground">
          Controla tus límites de gasto por categoría este mes.
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
                  <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                    {percentage}%
                  </Badge>
                </div>
                <CardDescription>
                  {formatEuros(budget.spent)} de {formatEuros(budget.limit)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={percentage} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
