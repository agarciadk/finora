import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ImportTransactionsDialog } from "@/components/import-transactions-dialog"
import type { Account, Category } from "@/lib/types"

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

const categories: Category[] = [
  {
    id: "category-income",
    name: "Ingresos",
    type: "INCOME",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "category-expense",
    name: "Alimentación",
    type: "EXPENSE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

function renderDialog() {
  return render(
    <ImportTransactionsDialog
      open
      onOpenChange={() => {}}
      accounts={accounts}
      categories={categories}
      onImported={() => {}}
    />
  )
}

describe("ImportTransactionsDialog", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("rejects files with an unsupported extension", async () => {
    // A real OS file picker restricted via `accept` wouldn't offer a .pdf,
    // but a user can still bypass it (e.g. "All files"), so simulate that.
    const user = userEvent.setup({ applyAccept: false })
    renderDialog()

    const file = new File(["contenido"], "movimientos.pdf", {
      type: "application/pdf",
    })
    const input = screen.getByLabelText(/archivo \(csv o xlsx\)/i)

    await user.upload(input, file)

    expect(
      await screen.findByText(/solo se admiten archivos csv o xlsx/i)
    ).toBeInTheDocument()
  })

  it("accepts a csv file and shows its name", async () => {
    const user = userEvent.setup()
    renderDialog()

    const file = new File(["Fecha,Concepto,Importe"], "movimientos.csv", {
      type: "text/csv",
    })
    const input = screen.getByLabelText(/archivo \(csv o xlsx\)/i)

    await user.upload(input, file)

    expect(
      await screen.findByText(/archivo seleccionado: movimientos\.csv/i)
    ).toBeInTheDocument()
  })

  it("shows a validation error when analyzing without a file", async () => {
    vi.stubGlobal("fetch", vi.fn())
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: /analizar archivo/i }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /selecciona un archivo/i
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
