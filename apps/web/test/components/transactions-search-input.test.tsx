import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TransactionsSearchInput } from "@/components/transactions-search-input"

describe("TransactionsSearchInput", () => {
  it("calls onChange with the typed value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TransactionsSearchInput value="" onChange={onChange} />)

    await user.type(screen.getByRole("searchbox"), "super")

    expect(onChange).toHaveBeenCalledWith("s")
    expect(onChange).toHaveBeenLastCalledWith("r")
  })

  it("only shows the clear button when there is a value", () => {
    const { rerender } = render(
      <TransactionsSearchInput value="" onChange={() => {}} />
    )
    expect(screen.queryByRole("button")).not.toBeInTheDocument()

    rerender(<TransactionsSearchInput value="super" onChange={() => {}} />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("clears the value when the clear button is clicked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TransactionsSearchInput value="super" onChange={onChange} />)
    await user.click(screen.getByRole("button"))

    expect(onChange).toHaveBeenCalledWith("")
  })
})
