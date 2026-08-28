import { Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TransactionsSearchInputProps = {
  value: string
  onChange: (value: string) => void
}

export function TransactionsSearchInput({
  value,
  onChange,
}: TransactionsSearchInputProps) {
  const { t } = useTranslation()
  const placeholder = t("transactions.filters.searchPlaceholder")

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full pl-8 sm:w-56"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label={t("transactions.filters.clear")}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
