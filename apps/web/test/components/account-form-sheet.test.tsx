import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { AccountFormSheet } from "@/components/account-form-sheet"
import type { Account } from "@/lib/types"

const account: Account = {
  id: "account-1",
  name: "Cuenta corriente",
  bank: "Banco",
  type: "CHECKING",
  balance: "1000.00",
  currency: "EUR",
  iban: "ES91 •••• •••• •••• 1332",
  interestRate: null,
  taxRate: null,
  interestPaymentDay: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("AccountFormSheet", () => {
  it("shows the create title and submits a new account", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()

    render(
      <AccountFormSheet
        open
        onOpenChange={onOpenChange}
        account={null}
        onSubmit={onSubmit}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Añadir cuenta" })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText("Nombre"), "Cuenta nueva")
    await user.type(screen.getByLabelText("Banco"), "Banco Nuevo")
    await user.type(screen.getByLabelText("Saldo"), "500")
    await user.click(screen.getByRole("button", { name: "Guardar" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Cuenta nueva",
        bank: "Banco Nuevo",
        balance: 500,
      })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("prefills the edit form from the given account and shows the masked IBAN hint", () => {
    render(
      <AccountFormSheet
        open
        onOpenChange={() => {}}
        account={account}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Editar cuenta" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Nombre")).toHaveValue(account.name)
    expect(screen.getByLabelText("Banco")).toHaveValue(account.bank)
    expect(
      screen.getByText(
        `Déjalo en blanco para mantener el IBAN actual (${account.iban}).`
      )
    ).toBeInTheDocument()
  })

  it("submits the updated account from the edit form", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <AccountFormSheet
        open
        onOpenChange={() => {}}
        account={account}
        onSubmit={onSubmit}
      />
    )

    await user.clear(screen.getByLabelText("Saldo"))
    await user.type(screen.getByLabelText("Saldo"), "1500")
    await user.click(screen.getByRole("button", { name: "Guardar" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: account.name, balance: 1500 })
    )
  })
})
