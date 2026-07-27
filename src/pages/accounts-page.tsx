import { Landmark, PiggyBank as PiggyBankIcon, Wallet } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const accounts = [
  {
    name: "Cuenta corriente",
    bank: "Banco Sabadell",
    balance: "€6.420,18",
    type: "Corriente",
    icon: Landmark,
  },
  {
    name: "Cuenta de ahorro",
    bank: "ING",
    balance: "€4.150,00",
    type: "Ahorro",
    icon: PiggyBankIcon,
  },
  {
    name: "Tarjeta de crédito",
    bank: "BBVA",
    balance: "-€289,50",
    type: "Crédito",
    icon: Wallet,
  },
  {
    name: "Cartera efectivo",
    bank: "Efectivo",
    balance: "€199,64",
    type: "Efectivo",
    icon: Wallet,
  },
]

export function AccountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Cuentas</h1>
        <p className="text-sm text-muted-foreground">
          Consulta el saldo de todas tus cuentas y tarjetas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => (
          <Card key={account.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <account.icon className="size-5 text-muted-foreground" />
                <Badge variant="secondary">{account.type}</Badge>
              </div>
              <CardTitle className="text-2xl">{account.balance}</CardTitle>
              <CardDescription>{account.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{account.bank}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
