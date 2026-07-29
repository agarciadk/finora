import { useEffect, useState } from "react"
import { AuthProviderContext } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import type { AuthUser } from "@/lib/types"

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

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

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login: async (email: string, password: string, rememberMe: boolean) => {
      const currentUser = await api.post<AuthUser>("/auth/login", {
        email,
        password,
        rememberMe,
      })
      setUser(currentUser)
      setIsAuthenticated(true)
    },
    register: async (name: string, email: string, password: string) => {
      const currentUser = await api.post<AuthUser>("/auth/register", {
        name,
        email,
        password,
      })
      setUser(currentUser)
      setIsAuthenticated(true)
    },
    logout: async () => {
      try {
        await api.post("/auth/logout", {})
      } finally {
        setUser(null)
        setIsAuthenticated(false)
      }
    },
  }

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  )
}
