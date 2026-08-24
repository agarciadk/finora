import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { VerifyEmailPage } from "@/pages/verify-email-page"

function renderVerifyEmailPage(search = "?token=raw-token") {
  return render(
    <MemoryRouter initialEntries={[`/verificar-email${search}`]}>
      <Routes>
        <Route path="/verificar-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shows a success message when the token is valid", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), { status: 200 })
    )

    renderVerifyEmailPage()

    expect(
      await screen.findByText(/se ha verificado correctamente/i)
    ).toBeInTheDocument()
  })

  it("shows an error message when the token is invalid", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 400,
      })
    )

    renderVerifyEmailPage()

    expect(
      await screen.findByText(/no es válido o ha caducado/i)
    ).toBeInTheDocument()
  })

  it("shows an error message when there is no token in the URL", async () => {
    renderVerifyEmailPage("")

    expect(
      await screen.findByText(/no es válido o ha caducado/i)
    ).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
