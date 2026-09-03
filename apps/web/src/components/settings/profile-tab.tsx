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
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import type { User } from "@/lib/types"

type SmartAssistantFormProps = {
  user: User
  onSave: (input: {
    mainIncomeSource?: string
    payday?: number
    mainIncomeAmount?: number
  }) => Promise<unknown>
}

function SmartAssistantForm({ user, onSave }: SmartAssistantFormProps) {
  const { t } = useTranslation()
  const [mainIncomeSource, setMainIncomeSource] = useState(
    user.mainIncomeSource ?? ""
  )
  const [payday, setPayday] = useState(
    user.payday === null ? "" : String(user.payday)
  )
  const [mainIncomeAmount, setMainIncomeAmount] = useState(
    user.mainIncomeAmount === null ? "" : user.mainIncomeAmount
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedSource = mainIncomeSource.trim()
    const parsedPayday = payday === "" ? undefined : Number(payday)
    const parsedIncomeAmount =
      mainIncomeAmount === "" ? undefined : Number(mainIncomeAmount)

    if (
      (parsedPayday !== undefined && Number.isNaN(parsedPayday)) ||
      (parsedIncomeAmount !== undefined && Number.isNaN(parsedIncomeAmount))
    ) {
      setError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      await onSave({
        mainIncomeSource: trimmedSource,
        payday: parsedPayday,
        mainIncomeAmount: parsedIncomeAmount,
      })
    } catch {
      setError(t("settings.profile.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="main-income-source">
          {t("settings.profile.smartAssistant.mainIncomeSourceLabel")}
        </Label>
        <Input
          id="main-income-source"
          placeholder={t(
            "settings.profile.smartAssistant.mainIncomeSourcePlaceholder"
          )}
          value={mainIncomeSource}
          onChange={(event) => setMainIncomeSource(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="main-income-amount">
          {t("settings.profile.smartAssistant.mainIncomeAmountLabel")}
        </Label>
        <Input
          id="main-income-amount"
          type="number"
          min="0"
          step="0.01"
          placeholder={t(
            "settings.profile.smartAssistant.mainIncomeAmountPlaceholder"
          )}
          value={mainIncomeAmount}
          onChange={(event) => setMainIncomeAmount(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="payday">
          {t("settings.profile.smartAssistant.paydayLabel")}
        </Label>
        <Input
          id="payday"
          type="number"
          min="1"
          max="31"
          step="1"
          placeholder={t("settings.profile.smartAssistant.paydayPlaceholder")}
          value={payday}
          onChange={(event) => setPayday(event.target.value)}
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

export function ProfileTab() {
  const { t } = useTranslation()
  const { user, updateUser } = useCurrentUser()

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile.smartAssistant.title")}</CardTitle>
          <CardDescription>
            {t("settings.profile.smartAssistant.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <SmartAssistantForm key={user.id} user={user} onSave={updateUser} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
