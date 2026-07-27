import type { Page } from "@playwright/test"

type LoginOptions = {
  email?: string
  password?: string
  rememberMe?: boolean
}

export async function login(page: Page, options: LoginOptions = {}) {
  const {
    email = "ada@example.com",
    password = "supersecret",
    rememberMe = false,
  } = options

  await page.goto("/login")
  await page.getByLabel("Correo electrónico").fill(email)
  await page.getByLabel("Contraseña").fill(password)

  if (rememberMe) {
    await page.getByRole("checkbox", { name: "Recordar mi sesión" }).check()
  }

  await page.getByRole("button", { name: "Iniciar sesión" }).click()
}
