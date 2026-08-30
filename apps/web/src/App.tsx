import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Toaster } from "@/components/ui/sonner"
import { DashboardPage } from "@/pages/dashboard-page"
import { AccountsPage } from "@/pages/accounts-page"
import { AccountDetailPage } from "@/pages/account-detail-page"
import { CategoriesPage } from "@/pages/categories-page"
import { TransactionsPage } from "@/pages/transactions-page"
import { BudgetsPage } from "@/pages/budgets-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { SettingsPage } from "@/pages/settings-page"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { VerifyEmailPage } from "@/pages/verify-email-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"
import { NotFoundPage } from "@/pages/not-found-page"

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
                <Route index element={<DashboardPage />} />
                <Route path="cuentas" element={<AccountsPage />} />
                <Route path="cuentas/:id" element={<AccountDetailPage />} />
                <Route path="categorias" element={<CategoriesPage />} />
                <Route path="transacciones" element={<TransactionsPage />} />
                <Route path="presupuestos" element={<BudgetsPage />} />
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
