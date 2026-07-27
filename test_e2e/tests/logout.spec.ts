import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Logout", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test("cancelling the confirmation keeps the session active", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Cerrar sesión" }).click()

    await expect(page.getByText("¿Cerrar sesión?")).toBeVisible()

    await page.getByRole("button", { name: "Cancelar" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Saldo total")).toBeVisible()
  })

  test("confirming logs the user out and redirects to /login", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Cerrar sesión" }).click()

    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cerrar sesión" })
      .click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText("Inicia sesión en finora")).toBeVisible()
  })
})
