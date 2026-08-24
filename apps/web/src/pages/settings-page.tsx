import { useState, type FormEvent } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TransactionsPagination } from "@/components/transactions-pagination"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useNotificationPreferences } from "@/hooks/use-notification-preferences"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import type { AuditAction, NotificationPreferenceType, User } from "@/lib/types"

const NOTIFICATION_PREFERENCES: Array<{
  id: string
  type: NotificationPreferenceType
  key: "budgetAlerts" | "weeklySummary" | "productNews"
}> = [
  { id: "budget-alerts", type: "BUDGET_ALERTS", key: "budgetAlerts" },
  { id: "weekly-summary", type: "WEEKLY_SUMMARY", key: "weeklySummary" },
  { id: "product-news", type: "PRODUCT_NEWS", key: "productNews" },
]

type ProfileFormProps = {
  user: User
  onSave: (input: { name: string; email: string }) => Promise<unknown>
}

function ProfileForm({ user, onSave }: ProfileFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(user.name ?? "")
  const [email, setEmail] = useState(user.email)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      await onSave({ name: name.trim(), email: email.trim() })
    } catch {
      setError(t("settings.profile.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("settings.profile.nameLabel")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("settings.profile.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("common.actions.saving") : t("settings.profile.saveButton")}
        </Button>
      </div>
    </form>
  )
}

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useCurrentUser()
  const { preferences, setPreference } = useNotificationPreferences()
  const [activityLogPage, setActivityLogPage] = useState(1)
  const { auditLogs, meta: activityLogMeta } = useAuditLogs(activityLogPage)

  function isPreferenceEnabled(
    type: NotificationPreferenceType,
    defaultEnabled: boolean
  ) {
    const preference = preferences.find((item) => item.type === type)
    return preference ? preference.enabled : defaultEnabled
  }

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
        <CardContent>
          {user && <ProfileForm key={user.id} user={user} onSave={updateUser} />}
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
          {NOTIFICATION_PREFERENCES.map((preference, index) => (
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
                  checked={isPreferenceEnabled(
                    preference.type,
                    preference.type !== "PRODUCT_NEWS"
                  )}
                  onCheckedChange={(checked) =>
                    void setPreference(preference.type, checked)
                  }
                />
              </div>
              {index < NOTIFICATION_PREFERENCES.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.activityLog.title")}</CardTitle>
          <CardDescription>
            {t("settings.activityLog.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("settings.activityLog.empty")}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("settings.activityLog.table.date")}</TableHead>
                    <TableHead>{t("settings.activityLog.table.action")}</TableHead>
                    <TableHead>{t("settings.activityLog.table.entity")}</TableHead>
                    <TableHead>{t("settings.activityLog.table.ip")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString(i18n.language)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t(`settings.activityLog.actions.${log.action}` as `settings.activityLog.actions.${AuditAction}`)}
                      </TableCell>
                      <TableCell>{log.entityName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.ipAddress ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TransactionsPagination
                page={activityLogMeta.page}
                totalPages={activityLogMeta.totalPages}
                onPageChange={setActivityLogPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
