import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const summaryCards = [
  {
    title: "Saldo total",
    value: "€12.480,32",
    description: "Actualizado hoy",
  },
  {
    title: "Ingresos del mes",
    value: "€3.250,00",
    description: "+8% respecto al mes anterior",
  },
  {
    title: "Gastos del mes",
    value: "€1.940,15",
    description: "-3% respecto al mes anterior",
  },
  {
    title: "Ahorro",
    value: "€1.309,85",
    description: "40% de tus ingresos",
  },
]

export function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl">{card.value}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
