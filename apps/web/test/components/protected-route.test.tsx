import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { AuthProvider } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("redirects to /login when there is no active session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )

    renderWithRoute("/")

    expect(await screen.findByText("Login page")).toBeInTheDocument()
  })

  it("renders the protected content when there is an active session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: "user-1",
            email: "ada@example.com",
            name: "Ada Lovelace",
          }),
          { status: 200 }
        )
      )
    )

    renderWithRoute("/")

    expect(await screen.findByText("Protected content")).toBeInTheDocument()
  })
})
