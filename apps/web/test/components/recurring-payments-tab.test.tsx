import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { RecurringPaymentsTab } from "@/components/planning/recurring-payments-tab"
import { api } from "@/lib/api"
import type { Account, Category, RecurringPayment } from "@/lib/types"

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const account: Account = {
  id: "account-1",
  name: "Cuenta corriente",
  bank: "Banco",
  type: "CHECKING",
  balance: "1000.00",
  currency: "EUR",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const category: Category = {
  id: "category-1",
  name: "Ocio",
  type: "EXPENSE",
  color: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const gymPayment: RecurringPayment = {
  id: "recurring-1",
  accountId: account.id,
  categoryId: category.id,
  name: "Gimnasio",
  amount: "40.00",
  type: "EXPENSE",
  frequency: "MONTHLY",
  startDate: "2026-01-15T00:00:00.000Z",
  endDate: "2026-02-15T00:00:00.000Z",
  nextPaymentDate: "2026-03-15T00:00:00.000Z",
  isActive: true,
  account,
  category,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

function mockApiGet(recurringPayments: RecurringPayment[]) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path === "/recurring-payments") return Promise.resolve(recurringPayments)
    if (path === "/accounts") return Promise.resolve([account])
    if (path === "/categories") return Promise.resolve([category])
    throw new Error(`Unexpected path: ${path}`)
  })
}

describe("RecurringPaymentsTab", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("lets the user fill in an optional end date on the create form", async () => {
    const user = userEvent.setup()
    mockApiGet([])

    render(<RecurringPaymentsTab />)

    await user.click(
      await screen.findByRole("button", { name: "Añadir pago recurrente" })
    )

    const endDateInput = screen.getByLabelText("Fecha de fin (opcional)")
    expect(endDateInput).toHaveValue("")

    await user.type(endDateInput, "2026-02-15")

    expect(endDateInput).toHaveValue("2026-02-15")
  })

  it("shows an ended payment as ended instead of showing its next payment date", async () => {
    mockApiGet([gymPayment])

    render(<RecurringPaymentsTab />)

    expect(await screen.findByText("Gimnasio")).toBeInTheDocument()
    expect(screen.getByText("Finalizado")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Marcar como pagado" })
    ).toBeDisabled()
  })
})
