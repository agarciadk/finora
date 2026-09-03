import { emitSessionEnded, emitSessionRefreshed } from "@/lib/session-events"
import type { AuthUser } from "@/lib/types"

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
const HTTP_UNAUTHORIZED = 401
const HTTP_NO_CONTENT = 204

// Listened to by use-idle-timer.ts, which lives outside this module: any API
// call counts as "activity", so a background fetch (or a user actively
// working through a slow mutation) never gets silently idle-logged-out.
export const USER_ACTIVITY_EVENT = "finora:user-activity"

function emitUserActivity() {
  window.dispatchEvent(new CustomEvent(USER_ACTIVITY_EVENT))
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let refreshPromise: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  refreshPromise ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) {
        // The AuthProvider decides whether this matters (it ignores it
        // unless a session was actually active), so it's safe to always emit.
        emitSessionEnded("expired")
        return false
      }
      // Keeps user.expiresAt fresh in AuthProvider after any silent refresh.
      const user = (await response.json()) as AuthUser
      emitSessionRefreshed(user)
      return true
    })
    .catch(() => {
      emitSessionEnded("expired")
      return false
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  emitUserActivity()

  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      // Skip Content-Type for FormData: the browser must set its own
      // multipart boundary, which we can't replicate manually.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  })

  if (
    response.status === HTTP_UNAUTHORIZED &&
    !isRetry &&
    !path.startsWith("/auth/")
  ) {
    const refreshed = await refreshSession()

    if (refreshed) {
      return request<T>(path, options, true)
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? response.statusText)

    throw new ApiError(response.status, message)
  }

  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T = void>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
}
