import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TransactionsPagination } from "@/components/transactions-pagination"

describe("TransactionsPagination", () => {
  it("shows the current page status and disables Previous on the first page", () => {
    render(
      <TransactionsPagination page={1} totalPages={3} onPageChange={() => {}} />
    )

    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled()
  })

  it("disables Next on the last page", () => {
    render(
      <TransactionsPagination page={3} totalPages={3} onPageChange={() => {}} />
    )

    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled()
  })

  it("calls onPageChange with the next/previous page when clicked", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <TransactionsPagination page={2} totalPages={3} onPageChange={onPageChange} />
    )

    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole("button", { name: "Anterior" }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it("treats 0 total pages as a single, empty page", () => {
    render(
      <TransactionsPagination page={1} totalPages={0} onPageChange={() => {}} />
    )

    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled()
  })
})
