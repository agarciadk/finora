import { useEffect, useRef, useState } from "react"
import { AuthProviderContext } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import {
  onSessionEnded,
  onSessionRefreshed,
  type SessionEndReason,
} from "@/lib/session-events"
import type { AuthUser } from "@/lib/types"

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionEndReason, setSessionEndReason] =
    useState<SessionEndReason | null>(null)
  const isAuthenticatedRef = useRef(isAuthenticated)

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await api.get<AuthUser>("/users/me")
        setUser(currentUser)
        setIsAuthenticated(true)
      } catch {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void checkSession()
  }, [])

  useEffect(() => {
    // lib/api.ts lives outside the React tree, so a failed silent refresh
    // reaches us through this event instead of a direct function call.
    // Ignore it unless there was actually an active session: the very first
    // /users/me check on a fresh page load also triggers a failed refresh,
    // but that's not a "session expired", just "never logged in".
    return onSessionEnded((reason) => {
      if (!isAuthenticatedRef.current) {
        return
      }
      void api.post("/auth/logout", {}).catch(() => undefined)
      setUser(null)
      setIsAuthenticated(false)
      setSessionEndReason(reason)
    })
  }, [])

  useEffect(() => {
    // Fired by lib/api.ts after ANY successful /auth/refresh (the reactive
    // 401 retry or the proactive heartbeat), so this is the single place
    // that keeps user.expiresAt current for the heartbeat to reschedule from.
    return onSessionRefreshed((refreshedUser) => {
      setUser(refreshedUser)
      setIsAuthenticated(true)
    })
  }, [])

  const value = {
    isAuthenticated,
    isLoading,
    user,
    sessionEndReason,
    clearSessionEndReason: () => setSessionEndReason(null),
    login: async (email: string, password: string, rememberMe: boolean) => {
      const currentUser = await api.post<AuthUser>("/auth/login", {
        email,
        password,
        rememberMe,
      })
      setUser(currentUser)
      setIsAuthenticated(true)
      setSessionEndReason(null)
    },
    register: async (name: string, email: string, password: string) => {
      // Registration no longer signs the user in: the backend requires a
      // verified email before /auth/login will succeed.
      await api.post("/auth/register", { name, email, password })
    },
    logout: async () => {
      try {
        await api.post("/auth/logout", {})
      } finally {
        setUser(null)
        setIsAuthenticated(false)
      }
    },
    endSession: async (reason: SessionEndReason) => {
      try {
        await api.post("/auth/logout", {})
      } finally {
        setUser(null)
        setIsAuthenticated(false)
        setSessionEndReason(reason)
      }
    },
  }

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  )
}
