import { useState } from "react"
import { CalendarRange } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DateRange = {
  startDate: string
  endDate: string
}

type TransactionsDateRangeFilterProps = {
  value: DateRange
  onApply: (range: DateRange) => void
  onClear: () => void
}

export function TransactionsDateRangeFilter({
  value,
  onApply,
  onClear,
}: TransactionsDateRangeFilterProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value)
    }
    setOpen(nextOpen)
  }

  function handleApply() {
    onApply(draft)
    setOpen(false)
  }

  function handleClear() {
    setDraft({ startDate: "", endDate: "" })
    onClear()
    setOpen(false)
  }

  const hasFilter = Boolean(value.startDate || value.endDate)

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(i18n.language, {
      timeZone: "UTC",
    })
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarRange />
        {hasFilter
          ? t("transactions.filters.dateRangeApplied", {
              startDate: value.startDate ? formatDate(value.startDate) : "…",
              endDate: value.endDate ? formatDate(value.endDate) : "…",
            })
          : t("transactions.filters.dateRangeButton")}
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-start-date">
              {t("transactions.filters.startDate")}
            </Label>
            <Input
              id="filter-start-date"
              type="date"
              value={draft.startDate}
              max={draft.endDate || undefined}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-end-date">
              {t("transactions.filters.endDate")}
            </Label>
            <Input
              id="filter-end-date"
              type="date"
              value={draft.endDate}
              min={draft.startDate || undefined}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              {t("transactions.filters.clear")}
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              {t("transactions.filters.apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
