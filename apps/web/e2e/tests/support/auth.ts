import type { Page } from "@playwright/test"

type LoginOptions = {
  email?: string
  password?: string
  rememberMe?: boolean
}

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
}

// Real auth requires an existing account, so every login first registers a
// fresh, unique user through the API before exercising the login form.
export async function login(page: Page, options: LoginOptions = {}) {
  const {
    email = uniqueEmail(),
    password = "supersecret123",
    rememberMe = false,
  } = options

  await page.request.post("/api/auth/register", {
    data: { name: "Ada Lovelace", email, password },
  })
  // The register call above already leaves the browser logged in; log out of
  // that session so the test can exercise the real login form below.
  await page.request.post("/api/auth/logout")

  await page.goto("/login")
  await page.getByLabel("Correo electrónico").fill(email)
  await page.getByLabel("Contraseña").fill(password)

  if (rememberMe) {
    await page.getByRole("checkbox", { name: "Recordar mi sesión" }).check()
  }

  await page.getByRole("button", { name: "Iniciar sesión" }).click()
  // Wait for the redirect so the auth cookies are guaranteed to be set
  // before the caller navigates elsewhere.
  await page.waitForURL(/\/$/)
}
