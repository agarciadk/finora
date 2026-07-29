export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "CASH"
export type TransactionType = "INCOME" | "EXPENSE"
export type NotificationPreferenceType =
  | "BUDGET_ALERTS"
  | "WEEKLY_SUMMARY"
  | "PRODUCT_NEWS"

export type Account = {
  id: string
  name: string
  bank: string
  type: AccountType
  balance: string
  currency: string
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  type: TransactionType
  createdAt: string
  updatedAt: string
}

export type Transaction = {
  id: string
  description: string
  amount: string
  type: TransactionType
  date: string
  accountId: string
  categoryId: string
  account: Account
  category: Category
  createdAt: string
  updatedAt: string
}

export type Budget = {
  id: string
  categoryId: string
  limit: string
  month: number
  year: number
  category: Category
  spent: string | number | null
  createdAt: string
  updatedAt: string
}

export type NotificationPreference = {
  id: string
  type: NotificationPreferenceType
  enabled: boolean
}

export type User = {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
}

export type SpendingByCategory = {
  categoryId: string
  category: string
  amount: number
  percentage: number
}

export type Analytics = {
  income: number
  expenses: number
  savingsRate: number
  incomeTrend: number | null
  expensesTrend: number | null
  savingsRateTrend: number | null
  spendingByCategory: SpendingByCategory[]
}

