// Centralizes the dynamic import() calls behind each code-split page, so
// App.tsx's React.lazy() definitions and DashboardLayout's Sidebar-click
// preloading (see dashboard-layout.tsx) share the exact same module
// specifiers - the browser's module cache dedupes them into a single fetch.
export const dashboardPage = () => import("@/pages/dashboard-page")
export const accountsPage = () => import("@/pages/accounts-page")
export const accountDetailPage = () => import("@/pages/account-detail-page")
export const categoriesPage = () => import("@/pages/categories-page")
export const transactionsPage = () => import("@/pages/transactions-page")
export const budgetsPage = () => import("@/pages/budgets-page")
export const recurringPaymentsPage = () =>
  import("@/pages/recurring-payments-page")
export const analyticsPage = () => import("@/pages/analytics-page")
export const settingsPage = () => import("@/pages/settings-page")
export const notFoundPage = () => import("@/pages/not-found-page")

// Maps every Sidebar-reachable route to its preloader, used to fetch a
// route's chunk *before* navigating to it so <Suspense> never actually needs
// to suspend for a Sidebar click (see DashboardLayout#navigateWithPendingState).
export const ROUTE_PRELOADERS: Record<string, () => Promise<unknown>> = {
  "/": dashboardPage,
  "/cuentas": accountsPage,
  "/categorias": categoriesPage,
  "/transacciones": transactionsPage,
  "/presupuestos": budgetsPage,
  "/recurrentes": recurringPaymentsPage,
  "/analitica": analyticsPage,
  "/ajustes": settingsPage,
}
