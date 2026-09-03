import {
  LayoutDashboard,
  Wallet,
  Tags,
  ArrowLeftRight,
  PiggyBank,
  Repeat,
  BarChart3,
  Settings,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    key: "dashboard",
    url: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    key: "accounts",
    url: "/cuentas",
    icon: Wallet,
    end: false,
  },
  {
    key: "categories",
    url: "/categorias",
    icon: Tags,
    end: false,
  },
  {
    key: "transactions",
    url: "/transacciones",
    icon: ArrowLeftRight,
    end: false,
  },
  {
    key: "budgets",
    url: "/presupuestos",
    icon: PiggyBank,
    end: false,
  },
  {
    key: "recurringPayments",
    url: "/recurrentes",
    icon: Repeat,
    end: false,
  },
  {
    key: "analytics",
    url: "/analitica",
    icon: BarChart3,
    end: false,
  },
] as const

export function AppSidebar({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  // NavLink's own click handler navigates outside of any transition, which
  // makes React hide the freshly-clicked route's already-mounted <Suspense>
  // fallback (see DashboardLayout) - so plain left-clicks are routed through
  // onNavigate instead, while modifier-key/middle clicks keep the browser's
  // native "open in new tab" behavior.
  function handleClick(to: string) {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return
      }
      event.preventDefault()
      onNavigate(to)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <nav aria-label={t("sidebar.ariaLabel")} className="contents">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.brand")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      render={
                        <NavLink
                          to={item.url}
                          end={item.end}
                          onClick={handleClick(item.url)}
                        />
                      }
                      isActive={
                        item.end
                          ? pathname === item.url
                          : pathname.startsWith(item.url)
                      }
                    >
                      <item.icon />
                      <span>{t(`sidebar.nav.${item.key}`)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <NavLink
                      to="/ajustes"
                      onClick={handleClick("/ajustes")}
                    />
                  }
                  isActive={pathname === "/ajustes"}
                >
                  <Settings />
                  <span>{t("sidebar.nav.settings")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </nav>
    </Sidebar>
  )
}
