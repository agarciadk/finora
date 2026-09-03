import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

const routes = [
  { link: "Patrimonio", path: "/patrimonio", heading: "Patrimonio" },
  { link: "Planificación", path: "/planificacion", heading: "Planificación" },
  { link: "Analítica", path: "/analitica", heading: "Analítica" },
  { link: "Ajustes", path: "/ajustes", heading: "Ajustes" },
]

test.describe("Sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  for (const { link, path, heading } of routes) {
    test(`navigates to ${link}`, async ({ page }) => {
      await page.getByRole("link", { name: link }).click()

      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole("heading", { name: heading })).toBeVisible()
    })
  }

  test("navigates back to the dashboard", async ({ page }) => {
    await page.getByRole("link", { name: "Patrimonio" }).click()
    await page.getByRole("link", { name: "Resumen" }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Saldo total")).toBeVisible()
  })

  test("can hide and show the sidebar with the toggle button", async ({
    page,
  }) => {
    const sidebar = page.locator('[data-slot="sidebar"]').first()

    await expect(sidebar).toHaveAttribute("data-state", "expanded")

    await page.getByRole("button", { name: "Toggle Sidebar" }).click()
    await expect(sidebar).toHaveAttribute("data-state", "collapsed")

    await page.getByRole("button", { name: "Toggle Sidebar" }).click()
    await expect(sidebar).toHaveAttribute("data-state", "expanded")
  })
})
