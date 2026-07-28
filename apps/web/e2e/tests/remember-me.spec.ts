import { expect, test, type Page } from "@playwright/test"

import { login } from "./support/auth"

async function logout(page: Page) {
  await page.getByRole("button", { name: "Cerrar sesión" }).click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Cerrar sesión" })
    .click()
}

test.describe("Remember me", () => {
  test("shows a welcome back card after logging out when remember me was checked", async ({
    page,
  }) => {
    await login(page, { email: "ada.lovelace@example.com", rememberMe: true })
    await logout(page)

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByText("Bienvenido de nuevo, Ada Lovelace")
    ).toBeVisible()
    await expect(page.getByText("ada.lovelace@example.com")).toBeVisible()

    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Saldo total")).toBeVisible()
  })

  test("'usar otra cuenta' forgets the remembered user and shows the form again", async ({
    page,
  }) => {
    await login(page, { email: "ada.lovelace@example.com", rememberMe: true })
    await logout(page)

    await page
      .getByRole("button", { name: "¿No eres tú? Usa otra cuenta" })
      .click()

    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
  })

  test("does not show the welcome back card when remember me was not checked", async ({
    page,
  }) => {
    await login(page, { rememberMe: false })
    await logout(page)

    await expect(page.getByLabel("Correo electrónico")).toBeVisible()
  })
})
