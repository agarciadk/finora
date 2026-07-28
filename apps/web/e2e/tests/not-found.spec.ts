import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("404", () => {
  test("shows the not found page for an unknown route while logged in", async ({
    page,
  }) => {
    await login(page)

    await page.goto("/una-ruta-que-no-existe")

    await expect(page.getByText("404")).toBeVisible()
    await expect(
      page.getByText("No hemos encontrado la página que buscas.")
    ).toBeVisible()

    await page.getByRole("link", { name: "Volver al dashboard" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Saldo total")).toBeVisible()
  })

  test("redirects to /login for an unknown route when not authenticated", async ({
    page,
  }) => {
    await page.goto("/una-ruta-que-no-existe")

    await expect(page).toHaveURL(/\/login$/)
  })
})
