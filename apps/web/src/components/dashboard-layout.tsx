import { Suspense, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { LogoutButton } from "@/components/logout-button"
import { IdleWarningModal } from "@/components/idle-warning-modal"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useIdleLogout } from "@/hooks/use-idle-logout"
import { ROUTE_PRELOADERS } from "@/lib/lazy-pages"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function ContentSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export function DashboardLayout() {
  const { t } = useTranslation()
  const { isIdleWarning, remainingSeconds, resetIdleTimer } = useIdleLogout()
  const navigate = useNavigate()
  // React Router wraps every Link/NavLink navigation in React.startTransition,
  // and React deliberately keeps an already-revealed <Suspense> boundary's
  // old content on screen during a transition instead of showing its
  // fallback - so a Sidebar click to a not-yet-downloaded route silently
  // freezes instead of showing a spinner, with no supported way to opt a
  // classic (non data-router) navigation out of that behavior. Sidestepped
  // entirely by preloading the target route's chunk *before* navigating:
  // once it's already resolved, Suspense has nothing left to suspend on.
  const [isNavigating, setIsNavigating] = useState(false)

  async function navigateWithPendingState(to: string) {
    const preload = ROUTE_PRELOADERS[to]
    if (!preload) {
      navigate(to)
      return
    }
    setIsNavigating(true)
    try {
      await preload()
    } catch {
      // Ignore preload failures - navigating anyway lets the normal
      // <Suspense>/error handling take over.
    } finally {
      navigate(to)
      setIsNavigating(false)
    }
  }

  return (
    <SidebarProvider>
      <IdleWarningModal
        open={isIdleWarning}
        remainingSeconds={remainingSeconds}
        onStay={resetIdleTimer}
      />
      <AppSidebar onNavigate={navigateWithPendingState} />
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
        <div className="relative flex flex-1 flex-col gap-4 p-4">
          {/* Sidebar/header (above) stay visible throughout; the overlay is a
          plain (non-transition) state update, so it appears the instant a
          Sidebar link is clicked, well before the chunk (already preloaded
          by navigateWithPendingState above) actually finishes downloading. */}
          <Suspense fallback={<ContentSpinner />}>
            <Outlet />
          </Suspense>
          {isNavigating ? (
            <div className="bg-background absolute inset-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
