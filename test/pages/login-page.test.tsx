import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { AuthProvider } from "@/components/auth-provider"
import { LoginPage } from "@/pages/login-page"

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("LoginPage", () => {
  it("shows validation errors when submitting empty fields", async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/introduce tu correo electrónico/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/introduce tu contraseña/i)).toBeInTheDocument()
  })

  it("shows an error for an invalid email format", async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "not-an-email"
    )
    await user.type(screen.getByLabelText(/contraseña/i), "supersecret")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/correo electrónico válido/i)
    ).toBeInTheDocument()
  })

  it("shows an error when the password is too short", async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.type(screen.getByLabelText(/contraseña/i), "123")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/al menos 8 caracteres/i)
    ).toBeInTheDocument()
  })

  it("logs in and navigates to the dashboard with valid credentials", async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.type(screen.getByLabelText(/contraseña/i), "supersecret")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(await screen.findByText("Dashboard")).toBeInTheDocument()
  })
})
