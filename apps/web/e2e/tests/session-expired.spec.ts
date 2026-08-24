import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Session expiration", () => {
  test("logs the user out and shows a toast when the silent refresh fails", async ({
    page,
  }) => {
    await login(page)
    await expect(page).toHaveURL(/\/$/)
    // Wait for the dashboard's own data to finish loading before installing
    // the mocks below, so we don't race the initial (real) accounts request.
    await expect(page.getByText("Saldo total")).toBeVisible()

    // Simulate an expired/invalid refresh token: the next authenticated
    // request should fail to silently refresh and force a logout.
    await page.route("**/api/auth/refresh", (route) =>
      route.fulfill({ status: 401 })
    )
    await page.route("**/api/accounts", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
    )

    await page.getByRole("link", { name: "Cuentas" }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByText(
        "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
      )
    ).toBeVisible()
  })
})
