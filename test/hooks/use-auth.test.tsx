import type { ReactNode } from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { AuthProvider } from "@/components/auth-provider"
import { useAuth } from "@/hooks/use-auth"

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it("starts unauthenticated with no remembered user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.rememberedUser).toBeNull()
  })

  it("logs in and remembers the user when rememberMe is true", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login("ada.lovelace@example.com", true)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.rememberedUser).toEqual({
      email: "ada.lovelace@example.com",
      name: "Ada Lovelace",
    })
    expect(localStorage.getItem("finora_session")).toBe("true")
    expect(localStorage.getItem("finora_remembered_user")).toContain(
      "ada.lovelace@example.com"
    )
  })

  it("does not remember the user when rememberMe is false", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login("ada.lovelace@example.com", false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.rememberedUser).toBeNull()
    expect(sessionStorage.getItem("finora_session")).toBe("true")
    expect(localStorage.getItem("finora_remembered_user")).toBeNull()
  })

  it("logout clears the active session but keeps the remembered user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login("ada.lovelace@example.com", true)
    })
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.rememberedUser).not.toBeNull()
    expect(localStorage.getItem("finora_session")).toBeNull()
  })

  it("forgetRememberedUser clears the stored user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login("ada.lovelace@example.com", true)
    })
    act(() => {
      result.current.forgetRememberedUser()
    })

    expect(result.current.rememberedUser).toBeNull()
    expect(localStorage.getItem("finora_remembered_user")).toBeNull()
  })
})
