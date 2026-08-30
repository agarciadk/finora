import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

type AnalyticsMonthSelectorProps = {
  month: number
  year: number
  isCurrentMonth: boolean
  onPreviousMonth: () => void
  onNextMonth: () => void
  onCurrentMonth: () => void
}

export function AnalyticsMonthSelector({
  month,
  year,
  isCurrentMonth,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}: AnalyticsMonthSelectorProps) {
  const { t, i18n } = useTranslation()
  const label = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)))

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={t("analytics.monthSelector.previous")}
        onClick={onPreviousMonth}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium capitalize">
        {label}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={t("analytics.monthSelector.next")}
        disabled={isCurrentMonth}
        onClick={onNextMonth}
      >
        <ChevronRight />
      </Button>
      {!isCurrentMonth && (
        <Button variant="ghost" size="sm" onClick={onCurrentMonth}>
          {t("analytics.monthSelector.today")}
        </Button>
      )}
    </div>
  )
}
