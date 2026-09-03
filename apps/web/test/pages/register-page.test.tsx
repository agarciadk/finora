import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { AuthProvider } from "@/components/auth-provider"
import { RegisterPage } from "@/pages/register-page"

async function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={["/registro"]}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
  // AuthProvider shows a full-screen spinner (not `children`) until the
  // initial /users/me check resolves, so wait for the real form to mount.
  await screen.findByLabelText(/^nombre$/i)
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^nombre$/i), "Ada Lovelace")
  await user.type(
    screen.getByLabelText(/correo electrónico/i),
    "ada@example.com"
  )
  await user.type(screen.getByLabelText(/^contraseña$/i), "supersecret")
  await user.type(
    screen.getByLabelText(/confirma tu contraseña/i),
    "supersecret"
  )
}

describe("RegisterPage", () => {
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
    await renderRegisterPage()

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    expect(await screen.findByText(/introduce tu nombre/i)).toBeInTheDocument()
    expect(
      screen.getByText(/introduce tu correo electrónico/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/introduce una contraseña/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.anything()
    )
  })

  it("shows an error when passwords don't match", async () => {
    const user = userEvent.setup()
    await renderRegisterPage()

    await user.type(screen.getByLabelText(/^nombre$/i), "Ada Lovelace")
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ada@example.com"
    )
    await user.type(screen.getByLabelText(/^contraseña$/i), "supersecret")
    await user.type(screen.getByLabelText(/confirma tu contraseña/i), "other")
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.anything()
    )
  })

  it("shows an error when the email is already registered", async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/register")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ message: "That email is already in use" }),
            { status: 409 }
          )
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const user = userEvent.setup()
    await renderRegisterPage()

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/ya existe una cuenta con ese correo/i)
    ).toBeInTheDocument()
  })

  it("registers and shows the check-your-email confirmation on success", async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/register")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              message: "Check your email to verify your account.",
            }),
            { status: 201 }
          )
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const user = userEvent.setup()
    await renderRegisterPage()

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument()
  })
})
