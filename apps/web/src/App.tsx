import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Toaster } from "@/components/ui/sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { VerifyEmailPage } from "@/pages/verify-email-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"

// Authenticated pages are code-split so their (and their dependencies', e.g.
// recharts) weight only loads once a user is signed in.
const DashboardPage = lazy(() =>
  import("@/pages/dashboard-page").then((m) => ({ default: m.DashboardPage }))
)
const AccountsPage = lazy(() =>
  import("@/pages/accounts-page").then((m) => ({ default: m.AccountsPage }))
)
const AccountDetailPage = lazy(() =>
  import("@/pages/account-detail-page").then((m) => ({
    default: m.AccountDetailPage,
  }))
)
const CategoriesPage = lazy(() =>
  import("@/pages/categories-page").then((m) => ({
    default: m.CategoriesPage,
  }))
)
const TransactionsPage = lazy(() =>
  import("@/pages/transactions-page").then((m) => ({
    default: m.TransactionsPage,
  }))
)
const BudgetsPage = lazy(() =>
  import("@/pages/budgets-page").then((m) => ({ default: m.BudgetsPage }))
)
const RecurringPaymentsPage = lazy(() =>
  import("@/pages/recurring-payments-page").then((m) => ({
    default: m.RecurringPaymentsPage,
  }))
)
const AnalyticsPage = lazy(() =>
  import("@/pages/analytics-page").then((m) => ({ default: m.AnalyticsPage }))
)
const SettingsPage = lazy(() =>
  import("@/pages/settings-page").then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = lazy(() =>
  import("@/pages/not-found-page").then((m) => ({ default: m.NotFoundPage }))
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
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="cuentas"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AccountsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="cuentas/:id"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AccountDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path="categorias"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <CategoriesPage />
                    </Suspense>
                  }
                />
                <Route
                  path="transacciones"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TransactionsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="presupuestos"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <BudgetsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="recurrentes"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RecurringPaymentsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="analitica"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AnalyticsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="ajustes"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SettingsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotFoundPage />
                    </Suspense>
                  }
                />
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
