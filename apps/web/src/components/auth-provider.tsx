import { useState } from "react"
import { AuthProviderContext, type RememberedUser } from "@/contexts/auth-context"

const SESSION_STORAGE_KEY = "finora_session"
const REMEMBERED_USER_STORAGE_KEY = "finora_remembered_user"

type AuthProviderProps = {
  children: React.ReactNode
}

function hasStoredSession() {
  return (
    localStorage.getItem(SESSION_STORAGE_KEY) !== null ||
    sessionStorage.getItem(SESSION_STORAGE_KEY) !== null
  )
}

function getDisplayNameFromEmail(email: string) {
  const [localPart] = email.split("@")

  return localPart
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function readRememberedUser(): RememberedUser | null {
  const stored = localStorage.getItem(REMEMBERED_USER_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as RememberedUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasStoredSession)
  const [rememberedUser, setRememberedUser] = useState<RememberedUser | null>(
    readRememberedUser
  )

  const value = {
    isAuthenticated,
    rememberedUser,
    login: (email: string, rememberMe: boolean) => {
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(SESSION_STORAGE_KEY, "true")

      if (rememberMe) {
        const user: RememberedUser = {
          email,
          name: getDisplayNameFromEmail(email),
        }
        localStorage.setItem(REMEMBERED_USER_STORAGE_KEY, JSON.stringify(user))
        setRememberedUser(user)
      } else {
        localStorage.removeItem(REMEMBERED_USER_STORAGE_KEY)
        setRememberedUser(null)
      }

      setIsAuthenticated(true)
    },
    logout: () => {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      setIsAuthenticated(false)
    },
    forgetRememberedUser: () => {
      localStorage.removeItem(REMEMBERED_USER_STORAGE_KEY)
      setRememberedUser(null)
    },
  }

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  )
}
