import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { ForgotPasswordPage } from "@/pages/forgot-password-page"

function renderForgotPasswordPage() {
  return render(
    <MemoryRouter initialEntries={["/recuperar-password"]}>
      <Routes>
        <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "generic" }), { status: 200 })
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows a validation error for an empty email", async () => {
    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

    expect(
      await screen.findByText(/introduce tu correo electrónico/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows the generic confirmation after submitting a valid email", async () => {
    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/forgot-password"),
      expect.anything()
    )
  })

  it("shows the same generic confirmation even when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

    const user = userEvent.setup()
    renderForgotPasswordPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument()
  })
})
