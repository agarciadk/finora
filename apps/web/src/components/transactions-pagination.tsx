import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

type TransactionsPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TransactionsPagination({
  page,
  totalPages,
  onPageChange,
}: TransactionsPaginationProps) {
  const { t } = useTranslation()
  const displayedTotalPages = Math.max(totalPages, 1)
  const canGoPrevious = page > 1
  const canGoNext = page < displayedTotalPages

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {t("transactions.pagination.status", {
          page,
          totalPages: displayedTotalPages,
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          {t("transactions.pagination.previous")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          {t("transactions.pagination.next")}
        </Button>
      </div>
    </div>
  )
}
