import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
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
    key: "analytics",
    url: "/analitica",
    icon: BarChart3,
    end: false,
  },
] as const

export function AppSidebar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

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
                      render={<NavLink to={item.url} end={item.end} />}
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
                  render={<NavLink to="/ajustes" />}
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
