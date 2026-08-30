import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Interest-bearing accounts", () => {
  test("creates an interest-bearing account and shows its projected interest on the detail page", async ({
    page,
  }) => {
    await login(page)

    await page.getByRole("link", { name: "Cuentas" }).click()
    await page.getByRole("button", { name: "Añadir cuenta" }).click()

    await page.getByLabel("Nombre").fill("Cuenta Naranja")
    await page.getByLabel("Banco").fill("ING")
    await page.getByLabel("Saldo").fill("12000")
    await page.getByRole("switch", { name: "Cuenta remunerada" }).click()
    await page.getByLabel("TAE (%)").fill("3")
    await page.getByLabel("Retención (%)").fill("19")
    await page.getByLabel("Día de pago (1-31)").fill("1")
    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText("TAE 3%")).toBeVisible()

    await page.getByText("Cuenta Naranja").click()

    await expect(page).toHaveURL(/\/cuentas\/[^/]+$/)
    await expect(
      page.getByRole("heading", { name: "Cuenta Naranja" })
    ).toBeVisible()
    await expect(page.getByText("Cuenta remunerada")).toBeVisible()
    await expect(page.getByText("Próximo interés estimado")).toBeVisible()
    await expect(
      page.getByText("Saldo medio (últimos 30 días)")
    ).toBeVisible()
  })

  test("hides the interest metrics card for a regular (non interest-bearing) account", async ({
    page,
  }) => {
    await login(page)

    await page.getByRole("link", { name: "Cuentas" }).click()
    await page.getByRole("button", { name: "Añadir cuenta" }).click()

    await page.getByLabel("Nombre").fill("Cuenta Corriente")
    await page.getByLabel("Banco").fill("BBVA")
    await page.getByLabel("Saldo").fill("500")
    await page.getByRole("button", { name: "Guardar" }).click()

    await page.getByText("Cuenta Corriente").click()

    await expect(page).toHaveURL(/\/cuentas\/[^/]+$/)
    await expect(
      page.getByRole("heading", { name: "Cuenta Corriente" })
    ).toBeVisible()
    await expect(page.getByText("Cuenta remunerada")).not.toBeVisible()
  })
})
