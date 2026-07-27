import { createContext } from "react"

export type RememberedUser = {
  email: string
  name: string
}

export type AuthContextState = {
  isAuthenticated: boolean
  rememberedUser: RememberedUser | null
  login: (email: string, rememberMe: boolean) => void
  logout: () => void
  forgetRememberedUser: () => void
}

export const initialState: AuthContextState = {
  isAuthenticated: false,
  rememberedUser: null,
  login: () => null,
  logout: () => null,
  forgetRememberedUser: () => null,
}

export const AuthProviderContext = createContext<AuthContextState>(initialState)
