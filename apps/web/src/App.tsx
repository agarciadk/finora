import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Toaster } from "@/components/ui/sonner"
import {
  accountDetailPage,
  accountsPage,
  analyticsPage,
  budgetsPage,
  categoriesPage,
  dashboardPage,
  notFoundPage,
  recurringPaymentsPage,
  settingsPage,
  transactionsPage,
} from "@/lib/lazy-pages"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { VerifyEmailPage } from "@/pages/verify-email-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"

// Authenticated pages are code-split so their (and their dependencies', e.g.
// recharts) weight only loads once a user is signed in.
const DashboardPage = lazy(() =>
  dashboardPage().then((m) => ({ default: m.DashboardPage }))
)
const AccountsPage = lazy(() =>
  accountsPage().then((m) => ({ default: m.AccountsPage }))
)
const AccountDetailPage = lazy(() =>
  accountDetailPage().then((m) => ({
    default: m.AccountDetailPage,
  }))
)
const CategoriesPage = lazy(() =>
  categoriesPage().then((m) => ({
    default: m.CategoriesPage,
  }))
)
const TransactionsPage = lazy(() =>
  transactionsPage().then((m) => ({
    default: m.TransactionsPage,
  }))
)
const BudgetsPage = lazy(() =>
  budgetsPage().then((m) => ({ default: m.BudgetsPage }))
)
const RecurringPaymentsPage = lazy(() =>
  recurringPaymentsPage().then((m) => ({
    default: m.RecurringPaymentsPage,
  }))
)
const AnalyticsPage = lazy(() =>
  analyticsPage().then((m) => ({ default: m.AnalyticsPage }))
)
const SettingsPage = lazy(() =>
  settingsPage().then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = lazy(() =>
  notFoundPage().then((m) => ({ default: m.NotFoundPage }))
)

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* AuthProvider needs router context to redirect to /login when the
        session ends (inactivity or a failed silent refresh). */}
        <AuthProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route path="verificar-email" element={<VerifyEmailPage />} />
            <Route
              path="recuperar-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="restablecer-password"
              element={<ResetPasswordPage />}
            />
            {/* DashboardLayout owns the loading UI for these routes (both the
            initial-mount Suspense fallback and the Sidebar-click pending
            state), so no per-route wrapper is needed here. */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="cuentas" element={<AccountsPage />} />
                <Route path="cuentas/:id" element={<AccountDetailPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
                <Route path="transacciones" element={<TransactionsPage />} />
                <Route path="presupuestos" element={<BudgetsPage />} />
                <Route
                  path="recurrentes"
                  element={<RecurringPaymentsPage />}
                />
                <Route path="analitica" element={<AnalyticsPage />} />
                <Route path="ajustes" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
