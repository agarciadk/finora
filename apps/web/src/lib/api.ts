import { emitSessionEnded } from "@/lib/session-events"

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
const HTTP_UNAUTHORIZED = 401
const HTTP_NO_CONTENT = 204

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
    .then((response) => {
      if (!response.ok) {
        // The AuthProvider decides whether this matters (it ignores it
        // unless a session was actually active), so it's safe to always emit.
        emitSessionEnded("expired")
      }
      return response.ok
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
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
}
