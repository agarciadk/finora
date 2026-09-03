import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
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
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: "user-1",
              email: "ada@example.com",
              name: "Ada Lovelace",
              expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            }),
            { status: 200 }
          )
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

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

  it("shows an error message for invalid credentials", async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ message: "Invalid email or password" }),
            { status: 401 }
          )
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.type(screen.getByLabelText(/contraseña/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/correo electrónico o contraseña incorrectos/i)
    ).toBeInTheDocument()
  })

  it("shows a specific message when the email hasn't been verified", async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: "EMAIL_NOT_VERIFIED" }), {
            status: 403,
          })
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.type(screen.getByLabelText(/contraseña/i), "supersecret")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/debes verificar tu correo/i)
    ).toBeInTheDocument()
  })
})
