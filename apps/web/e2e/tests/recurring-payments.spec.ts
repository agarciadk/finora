import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Recurring payments", () => {
  test("creates a recurring payment and marks it as paid, creating a transaction and advancing its next payment date", async ({
    page,
  }) => {
    await login(page)

    await page.getByRole("link", { name: "Patrimonio" }).click()
    await page.getByRole("button", { name: "Añadir cuenta" }).click()
    await page.getByLabel("Nombre").fill("Cuenta Corriente")
    await page.getByLabel("Banco").fill("BBVA")
    await page.getByLabel("Saldo").fill("1000")
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByText("Cuenta Corriente")).toBeVisible()

    await page.getByRole("link", { name: "Planificación" }).click()
    await page.getByRole("tab", { name: "Recurrentes" }).click()
    await expect(
      page.getByRole("button", { name: "Añadir pago recurrente" })
    ).toBeVisible()

    await page.getByRole("button", { name: "Añadir pago recurrente" }).click()
    await page.getByLabel("Nombre").fill("Netflix")
    await page.getByLabel("Importe").fill("15.99")
    await page
      .getByLabel("Cuenta", { exact: true })
      .click()
    await page.getByRole("option", { name: "Cuenta Corriente" }).click()
    await page.getByLabel("Categoría", { exact: true }).click()
    await page.getByRole("option", { name: "Ocio" }).click()
    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(
      page.getByRole("heading", { name: "Añadir pago recurrente" })
    ).not.toBeVisible()

    await expect(page.getByText("Netflix")).toBeVisible()
    await expect(page.getByText("-15,99 €")).toBeVisible()
    await expect(page.getByText("Mensual", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Marcar como pagado" }).click()
    await expect(
      page.getByRole("heading", { name: 'Marcar "Netflix" como pagado?' })
    ).toBeVisible()
    await page.getByRole("button", { name: "Confirmar" }).click()
    await expect(
      page.getByRole("heading", { name: 'Marcar "Netflix" como pagado?' })
    ).not.toBeVisible()

    await page.getByRole("link", { name: "Patrimonio" }).click()
    await page.getByRole("tab", { name: "Movimientos" }).click()
    await page
      .getByPlaceholder("Buscar por descripción…")
      .fill("Netflix")
    await expect(page.getByRole("cell", { name: "Netflix" })).toBeVisible()
  })
})
