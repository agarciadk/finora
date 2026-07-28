import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Compass className="size-10 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">
          {t("notFound.title")}
        </h1>
        <p className="text-muted-foreground">{t("notFound.message")}</p>
      </div>
      <Button render={<Link to="/" />}>{t("notFound.backToDashboard")}</Button>
    </div>
  )
}
