import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardPage } from "@/pages/dashboard-page"
import { AccountsPage } from "@/pages/accounts-page"
import { TransactionsPage } from "@/pages/transactions-page"
import { BudgetsPage } from "@/pages/budgets-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { SettingsPage } from "@/pages/settings-page"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { NotFoundPage } from "@/pages/not-found-page"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="cuentas" element={<AccountsPage />} />
                <Route path="transacciones" element={<TransactionsPage />} />
                <Route path="presupuestos" element={<BudgetsPage />} />
                <Route path="analitica" element={<AnalyticsPage />} />
                <Route path="ajustes" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
