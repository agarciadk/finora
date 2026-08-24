import path from "path"
import { fileURLToPath } from "url"
import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_FIXTURE = path.join(__dirname, "fixtures/movimientos.csv")

test.describe("Import transactions", () => {
  test("previews and confirms a CSV import for an existing account", async ({
    page,
  }) => {
    await login(page)

    const account = await page.request.post("/api/accounts", {
      data: {
        name: "Cuenta de importación",
        bank: "Banco de pruebas",
        type: "CHECKING",
        balance: 0,
      },
    })
    expect(account.ok()).toBeTruthy()

    await page.goto("/transacciones")
    await page.getByRole("button", { name: "Importar movimientos" }).click()

    await page.getByLabel("Cuenta").click()
    await page.getByRole("option", { name: "Cuenta de importación" }).click()

    await page
      .getByLabel("Archivo (CSV o XLSX)")
      .setInputFiles(CSV_FIXTURE)
    await expect(
      page.getByText("Archivo seleccionado: movimientos.csv")
    ).toBeVisible()

    await page.getByRole("button", { name: "Analizar archivo" }).click()

    await expect(page.getByText("Movimientos detectados")).toBeVisible()
    await expect(page.getByRole("cell", { name: "2" }).first()).toBeVisible()
    await expect(
      page.getByRole("cell", { name: "Supermercado Ejemplo" })
    ).toBeVisible()
    await expect(page.getByRole("cell", { name: "Nomina Marzo" })).toBeVisible()

    await page
      .getByRole("button", { name: /Importar 2 movimientos/ })
      .click()

    await expect(page.getByText("Importación completada")).toBeVisible()
    await expect(
      page.getByText("Se han importado 2 movimientos.")
    ).toBeVisible()

    await page.getByRole("button", { name: "Cerrar" }).click()

    await expect(
      page.getByRole("cell", { name: "Supermercado Ejemplo" })
    ).toBeVisible()
    await expect(page.getByRole("cell", { name: "Nomina Marzo" })).toBeVisible()
  })
})
