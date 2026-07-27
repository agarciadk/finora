import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Login", () => {
  test("redirects to /login when there is no active session", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText("Inicia sesión en finora")).toBeVisible()
  })

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await expect(
      page.getByText("Introduce tu correo electrónico.")
    ).toBeVisible()
    await expect(page.getByText("Introduce tu contraseña.")).toBeVisible()
  })

  test("shows an error for an invalid email", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("Correo electrónico").fill("not-an-email")
    await page.getByLabel("Contraseña").fill("supersecret")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await expect(
      page.getByText("Introduce un correo electrónico válido.")
    ).toBeVisible()
  })

  test("shows an error for a short password", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("Correo electrónico").fill("ada@example.com")
    await page.getByLabel("Contraseña").fill("123")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await expect(
      page.getByText("La contraseña debe tener al menos 8 caracteres.")
    ).toBeVisible()
  })

  test("logs in with valid credentials and reaches the dashboard", async ({
    page,
  }) => {
    await login(page)

    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator("header").getByText("finora")).toBeVisible()
    await expect(page.getByText("Saldo total")).toBeVisible()
  })
})
