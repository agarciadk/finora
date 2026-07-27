import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const notificationPreferences = [
  {
    id: "budget-alerts",
    label: "Alertas de presupuesto",
    description: "Recibe un aviso cuando superes un límite de gasto.",
    defaultChecked: true,
  },
  {
    id: "weekly-summary",
    label: "Resumen semanal",
    description: "Un correo con el resumen de tus finanzas cada semana.",
    defaultChecked: true,
  },
  {
    id: "product-news",
    label: "Novedades de Finora",
    description: "Entérate de nuevas funciones y mejoras.",
    defaultChecked: false,
  },
]

export function SettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tu perfil, preferencias y notificaciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" defaultValue="Alberto García" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" defaultValue="alberto@finora.app" />
          </div>
          <div>
            <Button>Guardar cambios</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Elige qué notificaciones quieres recibir.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {notificationPreferences.map((preference, index) => (
            <div key={preference.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={preference.id}>{preference.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {preference.description}
                  </p>
                </div>
                <Switch
                  id={preference.id}
                  defaultChecked={preference.defaultChecked}
                />
              </div>
              {index < notificationPreferences.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
