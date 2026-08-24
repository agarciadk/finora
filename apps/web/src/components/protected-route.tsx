import { Navigate, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/hooks/use-auth"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, sessionEndReason } = useAuth()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={sessionEndReason ? { reason: sessionEndReason } : undefined}
      />
    )
  }

  return <Outlet />
}
