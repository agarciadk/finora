import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { ResetPasswordPage } from "@/pages/reset-password-page"

function renderResetPasswordPage(search = "?token=raw-token") {
  return render(
    <MemoryRouter initialEntries={[`/restablecer-password${search}`]}>
      <Routes>
        <Route
          path="/restablecer-password"
          element={<ResetPasswordPage />}
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows validation errors for an empty password", async () => {
    const user = userEvent.setup()
    renderResetPasswordPage()

    await user.click(
      screen.getByRole("button", { name: /restablecer contraseña/i })
    )

    expect(
      await screen.findByText(/introduce una contraseña/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows an error when passwords don't match", async () => {
    const user = userEvent.setup()
    renderResetPasswordPage()

    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "newpass123")
    await user.type(
      screen.getByLabelText(/confirma tu nueva contraseña/i),
      "other12345"
    )
    await user.click(
      screen.getByRole("button", { name: /restablecer contraseña/i })
    )

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows a success message when the reset succeeds", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 200 })
    )

    const user = userEvent.setup()
    renderResetPasswordPage()

    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "newpass123")
    await user.type(
      screen.getByLabelText(/confirma tu nueva contraseña/i),
      "newpass123"
    )
    await user.click(
      screen.getByRole("button", { name: /restablecer contraseña/i })
    )

    expect(
      await screen.findByText(/contraseña actualizada/i)
    ).toBeInTheDocument()
  })

  it("shows an error when the token is invalid or expired", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid or expired token" }), {
        status: 400,
      })
    )

    const user = userEvent.setup()
    renderResetPasswordPage()

    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "newpass123")
    await user.type(
      screen.getByLabelText(/confirma tu nueva contraseña/i),
      "newpass123"
    )
    await user.click(
      screen.getByRole("button", { name: /restablecer contraseña/i })
    )

    expect(
      await screen.findByText(/no es válido o ha caducado/i)
    ).toBeInTheDocument()
  })
})
