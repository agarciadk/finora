import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TransactionsBulkActionsBar } from "@/components/transactions-bulk-actions-bar"
import type { Account, Category } from "@/lib/types"

const categories: Category[] = [
  {
    id: "category-1",
    name: "Alimentación",
    type: "EXPENSE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

const accounts: Account[] = [
  {
    id: "account-1",
    name: "Cuenta corriente",
    bank: "Banco",
    type: "CHECKING",
    balance: "1000.00",
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

function renderBar(overrides: Partial<Parameters<typeof TransactionsBulkActionsBar>[0]> = {}) {
  const props = {
    selectedCount: 2,
    categories,
    accounts,
    onChangeCategory: vi.fn().mockResolvedValue(undefined),
    onChangeAccount: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClearSelection: vi.fn(),
    ...overrides,
  }
  render(<TransactionsBulkActionsBar {...props} />)
  return props
}

describe("TransactionsBulkActionsBar", () => {
  it("shows the selected count and calls onClearSelection", async () => {
    const user = userEvent.setup()
    const props = renderBar()

    expect(screen.getByText("2 transacciones seleccionadas")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Cancelar selección" })
    )
    expect(props.onClearSelection).toHaveBeenCalled()
  })

  it("confirms the bulk delete after opening the AlertDialog", async () => {
    const user = userEvent.setup()
    const props = renderBar()

    await user.click(
      screen.getByRole("button", { name: /eliminar seleccionadas/i })
    )
    await user.click(
      await screen.findByRole("button", { name: "Eliminar" })
    )

    expect(props.onDelete).toHaveBeenCalled()
  })

  it("changes the category of the selected transactions", async () => {
    const user = userEvent.setup()
    const props = renderBar()

    await user.click(
      screen.getByRole("button", { name: /cambiar categoría/i })
    )
    await user.click(await screen.findByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: /alimentación/i }))
    await user.click(screen.getByRole("button", { name: "Guardar" }))

    expect(props.onChangeCategory).toHaveBeenCalledWith("category-1")
  })
})
