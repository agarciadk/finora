import { createContext } from "react"
import type { AuthUser } from "@/lib/types"
import type { SessionEndReason } from "@/lib/session-events"

export type AuthContextState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  /** Why the last session ended (inactivity, expired refresh), if any. */
  sessionEndReason: SessionEndReason | null
  clearSessionEndReason: () => void
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Logs out and records why, so the login page can explain it to the user. */
  endSession: (reason: SessionEndReason) => Promise<void>
}

export const initialState: AuthContextState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  sessionEndReason: null,
  clearSessionEndReason: () => undefined,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  endSession: () => Promise.resolve(),
}

export const AuthProviderContext = createContext<AuthContextState>(initialState)
