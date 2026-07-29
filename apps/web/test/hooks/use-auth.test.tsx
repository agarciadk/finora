import type { ReactNode } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "@/components/auth-provider"
import { useAuth } from "@/hooks/use-auth"

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status })
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("starts loading then unauthenticated when there is no session cookie", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it("logs in and stores the returned user", async () => {
    const user = { id: "user-1", email: "ada@example.com", name: "Ada Lovelace" }
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(jsonResponse(user, 200))
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login("ada@example.com", "supersecret", false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(user)
  })

  it("rejects login with invalid credentials", async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(
          jsonResponse({ message: "Invalid email or password" }, 401)
        )
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      result.current.login("ada@example.com", "wrong", false)
    ).rejects.toThrow()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it("logout revokes the session and clears the user", async () => {
    const user = { id: "user-1", email: "ada@example.com", name: "Ada Lovelace" }
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes("/auth/login")) {
        return Promise.resolve(jsonResponse(user, 200))
      }
      if (url.includes("/auth/logout")) {
        return Promise.resolve(new Response(null, { status: 204 }))
      }
      return Promise.resolve(new Response(null, { status: 401 }))
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login("ada@example.com", "supersecret", false)
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
