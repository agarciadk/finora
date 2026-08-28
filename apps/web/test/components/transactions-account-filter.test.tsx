import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TransactionsAccountFilter } from "@/components/transactions-account-filter"
import type { Account } from "@/lib/types"

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
  {
    id: "account-2",
    name: "Ahorros",
    bank: "Banco",
    type: "SAVINGS",
    balance: "2000.00",
    currency: "EUR",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

describe("TransactionsAccountFilter", () => {
  it("shows the button label when no account is selected", () => {
    render(
      <TransactionsAccountFilter
        accounts={accounts}
        selectedAccountIds={[]}
        onChange={() => {}}
      />
    )

    expect(screen.getByRole("button", { name: /cuentas/i })).toBeInTheDocument()
  })

  it("shows the selected count when accounts are selected", () => {
    render(
      <TransactionsAccountFilter
        accounts={accounts}
        selectedAccountIds={["account-1"]}
        onChange={() => {}}
      />
    )

    expect(
      screen.getByRole("button", { name: /1 cuenta/i })
    ).toBeInTheDocument()
  })

  it("adds an account to the selection when its checkbox is checked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TransactionsAccountFilter
        accounts={accounts}
        selectedAccountIds={[]}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: /cuentas/i }))
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "Ahorros" })
    )

    expect(onChange).toHaveBeenCalledWith(["account-2"])
  })

  it("removes an account from the selection when its checkbox is unchecked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <TransactionsAccountFilter
        accounts={accounts}
        selectedAccountIds={["account-1", "account-2"]}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole("button", { name: /2 cuentas/i }))
    await user.click(
      await screen.findByRole("menuitemcheckbox", { name: "Cuenta corriente" })
    )

    expect(onChange).toHaveBeenCalledWith(["account-2"])
  })
})
