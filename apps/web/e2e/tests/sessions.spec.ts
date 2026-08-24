import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Active sessions", () => {
  test("shows the current session in the settings page", async ({ page }) => {
    await login(page)

    await page.getByRole("link", { name: "Ajustes" }).click()
    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible()

    await expect(page.getByText("Sesiones activas")).toBeVisible()
    await expect(page.getByText("Sesión actual")).toBeVisible()
  })
})
