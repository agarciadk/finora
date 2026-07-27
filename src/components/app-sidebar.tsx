import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Settings,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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
    title: "Resumen",
    url: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    title: "Cuentas",
    url: "/cuentas",
    icon: Wallet,
  },
  {
    title: "Transacciones",
    url: "/transacciones",
    icon: ArrowLeftRight,
  },
  {
    title: "Presupuestos",
    url: "/presupuestos",
    icon: PiggyBank,
  },
  {
    title: "Analítica",
    url: "/analitica",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Finora</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<NavLink to={item.url} end={item.end} />}
                    isActive={
                      item.end ? pathname === item.url : pathname.startsWith(item.url)
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
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
                <span>Ajustes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  )
}
