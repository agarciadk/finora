import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { LogoutButton } from "@/components/logout-button"
import { IdleWarningModal } from "@/components/idle-warning-modal"
import { Separator } from "@/components/ui/separator"
import { useIdleLogout } from "@/hooks/use-idle-logout"
import { useSessionHeartbeat } from "@/hooks/use-session-heartbeat"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardLayout() {
  const { t } = useTranslation()
  const { isIdleWarning, remainingSeconds, resetIdleTimer } = useIdleLogout()
  useSessionHeartbeat()

  return (
    <SidebarProvider>
      <IdleWarningModal
        open={isIdleWarning}
        remainingSeconds={remainingSeconds}
        onStay={resetIdleTimer}
      />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <span className="font-heading text-lg font-semibold">
              {t("sidebar.brand").toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ModeToggle />
            <LogoutButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
