import { createContext } from "react"
import type { AuthUser } from "@/lib/types"

export type AuthContextState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const initialState: AuthContextState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
}

export const AuthProviderContext = createContext<AuthContextState>(initialState)
