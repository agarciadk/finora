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

export type ImportRowStatus = "valid" | "invalid" | "duplicate"

export type ImportPreviewRow = {
  rowNumber: number
  date: string | null
  description: string
  amount: string | null
  balance: string | null
  status: ImportRowStatus
  errors: string[]
}

export type ImportPreviewResult = {
  fileName: string
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  dateRange: { from: string; to: string } | null
  transactions: ImportPreviewRow[]
}

export type ImportConfirmResult = {
  imported: number
  duplicates: number
  invalid: number
}

export type BulkUpdateResult = { updated: number }
export type BulkDeleteResult = { deleted: number }

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

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN"

export type AuditLog = {
  id: string
  action: AuditAction
  entityName: string
  entityId: string | null
  ipAddress: string | null
  createdAt: string
}

export type Session = {
  id: string
  ipAddress: string | null
  userAgent: string | null
  lastActive: string
  createdAt: string
  isCurrent: boolean
}


