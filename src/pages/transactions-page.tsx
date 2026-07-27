import { useTranslation } from "react-i18next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const transactions = [
  {
    date: "24 jul 2026",
    description: "Nómina",
    category: "Ingresos",
    account: "Cuenta corriente",
    amount: "+€2.100,00",
    type: "ingreso",
  },
  {
    date: "23 jul 2026",
    description: "Supermercado Mercadona",
    category: "Alimentación",
    account: "Tarjeta de crédito",
    amount: "-€64,32",
    type: "gasto",
  },
  {
    date: "22 jul 2026",
    description: "Suscripción Netflix",
    category: "Ocio",
    account: "Cuenta corriente",
    amount: "-€12,99",
    type: "gasto",
  },
  {
    date: "20 jul 2026",
    description: "Transferencia a ahorro",
    category: "Ahorro",
    account: "Cuenta de ahorro",
    amount: "-€300,00",
    type: "gasto",
  },
  {
    date: "18 jul 2026",
    description: "Venta artículo Wallapop",
    category: "Otros ingresos",
    account: "Cuenta corriente",
    amount: "+€45,00",
    type: "ingreso",
  },
  {
    date: "15 jul 2026",
    description: "Gasolina",
    category: "Transporte",
    account: "Tarjeta de crédito",
    amount: "-€58,20",
    type: "gasto",
  },
]

export function TransactionsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("transactions.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("transactions.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.recentTitle")}</CardTitle>
          <CardDescription>
            {t("transactions.recentDescription", {
              count: transactions.length,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("transactions.table.date")}</TableHead>
                <TableHead>{t("transactions.table.description")}</TableHead>
                <TableHead>{t("transactions.table.category")}</TableHead>
                <TableHead>{t("transactions.table.account")}</TableHead>
                <TableHead className="text-right">
                  {t("transactions.table.amount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.description + transaction.date}>
                  <TableCell className="text-muted-foreground">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.account}
                  </TableCell>
                  <TableCell
                    className={
                      "text-right font-medium " +
                      (transaction.type === "ingreso"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-foreground")
                    }
                  >
                    {transaction.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
