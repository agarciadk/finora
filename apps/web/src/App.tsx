import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Toaster } from "@/components/ui/sonner"
import {
  accountDetailPage,
  analyticsPage,
  dashboardPage,
  notFoundPage,
  planningPage,
  settingsPage,
  wealthPage,
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
const WealthPage = lazy(() =>
  wealthPage().then((m) => ({ default: m.WealthPage }))
)
const AccountDetailPage = lazy(() =>
  accountDetailPage().then((m) => ({
    default: m.AccountDetailPage,
  }))
)
const PlanningPage = lazy(() =>
  planningPage().then((m) => ({ default: m.PlanningPage }))
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
                <Route path="patrimonio" element={<WealthPage />} />
                <Route
                  path="patrimonio/cuentas/:id"
                  element={<AccountDetailPage />}
                />
                <Route path="planificacion" element={<PlanningPage />} />
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
