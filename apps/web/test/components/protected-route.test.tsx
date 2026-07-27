import { beforeEach, describe, expect, it } from "vitest"
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
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it("redirects to /login when there is no active session", () => {
    renderWithRoute("/")

    expect(screen.getByText("Login page")).toBeInTheDocument()
  })

  it("renders the protected content when there is an active session", () => {
    sessionStorage.setItem("finora_session", "true")

    renderWithRoute("/")

    expect(screen.getByText("Protected content")).toBeInTheDocument()
  })
})
