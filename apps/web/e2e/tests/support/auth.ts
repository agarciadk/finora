import type { Page } from "@playwright/test"

type RegisterOptions = {
  name?: string
  email?: string
  password?: string
}

type LoginOptions = RegisterOptions & {
  rememberMe?: boolean
}

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
}

// The API only hands back `verificationToken` in the register response when
// NODE_ENV=test (see apps/api/src/auth/auth.service.ts) — this is the
// "backdoor" that lets Playwright verify an account without a real mailbox.
// playwright.config.ts forces NODE_ENV=test on the API it starts for e2e.
export async function registerVerifiedUser(
  page: Page,
  options: RegisterOptions = {}
) {
  const {
    name = "Ada Lovelace",
    email = uniqueEmail(),
    password = "supersecret123",
  } = options

  const response = await page.request.post("/api/auth/register", {
    data: { name, email, password },
  })
  const body = (await response.json()) as { verificationToken?: string }

  if (!body.verificationToken) {
    throw new Error(
      "verificationToken missing from /auth/register response — is the API running with NODE_ENV=test?"
    )
  }

  await page.request.post("/api/auth/verify-email", {
    data: { token: body.verificationToken },
  })

  return { name, email, password }
}

// Real auth requires an existing, verified account, so every login first
// registers and verifies a fresh, unique user through the API before
// exercising the login form.
export async function login(page: Page, options: LoginOptions = {}) {
  const { rememberMe = false, ...registerOptions } = options
  const { email, password } = await registerVerifiedUser(page, registerOptions)

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

