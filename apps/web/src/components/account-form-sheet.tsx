import { useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { AccountInput } from "@/hooks/use-accounts"
import type { Account, AccountType } from "@/lib/types"

const ACCOUNT_TYPES: AccountType[] = [
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "CASH",
]

const EMPTY_FORM = {
  name: "",
  bank: "",
  type: "CHECKING" as AccountType,
  balance: "",
  iban: "",
  isInterestBearing: false,
  interestRate: "",
  taxRate: "",
  interestPaymentDay: "",
}

type AccountFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Account | null
  onSubmit: (input: AccountInput) => Promise<void>
}

export function AccountFormSheet({
  open,
  onOpenChange,
  account,
  onSubmit,
}: AccountFormSheetProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Reset the form whenever the sheet transitions into "open" for a given
  // account, without an effect (see `set-state-in-effect` in the gotchas doc)
  // — this is React's documented "adjust state during render" pattern.
  const openKey = open ? (account?.id ?? "__create__") : null
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(null)
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey)
    if (openKey !== null) {
      setFormError(null)
      setForm(
        account
          ? {
              name: account.name,
              bank: account.bank,
              type: account.type,
              balance: account.balance,
              // The API only ever returns a masked IBAN, so the field starts
              // empty here — re-enter the full value to change it, leave it
              // blank to keep the current one (see the placeholder for its
              // masked reminder).
              iban: "",
              isInterestBearing: account.interestRate !== null,
              interestRate: account.interestRate ?? "",
              taxRate: account.taxRate ?? "",
              interestPaymentDay:
                account.interestPaymentDay === null
                  ? ""
                  : String(account.interestPaymentDay),
            }
          : EMPTY_FORM
      )
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const input: AccountInput = {
      name: form.name.trim(),
      bank: form.bank.trim(),
      type: form.type,
      balance: Number(form.balance),
      iban: form.iban.trim() || undefined,
      interestRate: form.isInterestBearing ? Number(form.interestRate) : null,
      taxRate: form.isInterestBearing ? Number(form.taxRate) : null,
      interestPaymentDay: form.isInterestBearing
        ? Number(form.interestPaymentDay)
        : null,
    }

    if (
      !input.name ||
      !input.bank ||
      Number.isNaN(input.balance) ||
      (form.isInterestBearing &&
        (Number.isNaN(input.interestRate) ||
          Number.isNaN(input.taxRate) ||
          Number.isNaN(input.interestPaymentDay)))
    ) {
      setFormError(t("common.errors.generic"))
      return
    }

    setIsSaving(true)

    try {
      await onSubmit(input)
      onOpenChange(false)
    } catch {
      setFormError(t("accounts.errors.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>
              {account
                ? t("accounts.form.editTitle")
                : t("accounts.form.createTitle")}
            </SheetTitle>
            <SheetDescription>
              {t("accounts.form.description")}
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-name">
                {t("accounts.form.nameLabel")}
              </Label>
              <Input
                id="account-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-bank">
                {t("accounts.form.bankLabel")}
              </Label>
              <Input
                id="account-bank"
                value={form.bank}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bank: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-type">
                {t("accounts.form.typeLabel")}
              </Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    type: value as AccountType,
                  }))
                }
                items={Object.fromEntries(
                  ACCOUNT_TYPES.map((type) => [
                    type,
                    t(`accounts.types.${type}`),
                  ])
                )}
              >
                <SelectTrigger id="account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`accounts.types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-balance">
                {t("accounts.form.balanceLabel")}
              </Label>
              <Input
                id="account-balance"
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    balance: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-iban">
                {t("accounts.form.ibanLabel")}
              </Label>
              <Input
                id="account-iban"
                placeholder={t("accounts.form.ibanPlaceholder")}
                value={form.iban}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    iban: event.target.value,
                  }))
                }
              />
              {account?.iban && (
                <p className="text-sm text-muted-foreground">
                  {t("accounts.form.ibanEditHint", {
                    iban: account.iban,
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="account-interest-bearing">
                  {t("accounts.form.interestBearingLabel")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("accounts.form.interestBearingDescription")}
                </p>
              </div>
              <Switch
                id="account-interest-bearing"
                checked={form.isInterestBearing}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isInterestBearing: checked,
                  }))
                }
              />
            </div>
            {form.isInterestBearing && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-interest-rate">
                    {t("accounts.form.interestRateLabel")}
                  </Label>
                  <Input
                    id="account-interest-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.interestRate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        interestRate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-tax-rate">
                    {t("accounts.form.taxRateLabel")}
                  </Label>
                  <Input
                    id="account-tax-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.taxRate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        taxRate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account-interest-payment-day">
                    {t("accounts.form.interestPaymentDayLabel")}
                  </Label>
                  <Input
                    id="account-interest-payment-day"
                    type="number"
                    step="1"
                    min="1"
                    max="31"
                    value={form.interestPaymentDay}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        interestPaymentDay: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </>
            )}
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t("common.actions.saving")
                : t("common.actions.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
