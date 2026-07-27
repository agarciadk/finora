import { useTranslation } from "react-i18next"

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
    key: "budgetAlerts",
    defaultChecked: true,
  },
  {
    id: "weekly-summary",
    key: "weeklySummary",
    defaultChecked: true,
  },
  {
    id: "product-news",
    key: "productNews",
    defaultChecked: false,
  },
] as const

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile.title")}</CardTitle>
          <CardDescription>
            {t("settings.profile.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("settings.profile.nameLabel")}</Label>
            <Input id="name" defaultValue="Alberto García" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("settings.profile.emailLabel")}</Label>
            <Input id="email" type="email" defaultValue="alberto@finora.app" />
          </div>
          <div>
            <Button>{t("settings.profile.saveButton")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications.title")}</CardTitle>
          <CardDescription>
            {t("settings.notifications.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {notificationPreferences.map((preference, index) => (
            <div key={preference.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={preference.id}>
                    {t(`settings.notifications.${preference.key}.label`)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(`settings.notifications.${preference.key}.description`)}
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
