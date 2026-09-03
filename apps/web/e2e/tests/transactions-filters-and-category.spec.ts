import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

type Category = { id: string; name: string; type: string }

async function createAccount(page: import("@playwright/test").Page) {
  const response = await page.request.post("/api/accounts", {
    data: {
      name: "Cuenta de pruebas",
      bank: "Banco de pruebas",
      type: "CHECKING",
      balance: 0,
    },
  })
  expect(response.ok()).toBeTruthy()
  return (await response.json()) as { id: string }
}

async function getExpenseCategory(
  page: import("@playwright/test").Page,
  name: string
) {
  const response = await page.request.get("/api/categories")
  expect(response.ok()).toBeTruthy()
  const categories = (await response.json()) as Category[]
  const category = categories.find((item) => item.name === name)
  if (!category) throw new Error(`Category "${name}" not found`)
  return category
}

async function createTransaction(
  page: import("@playwright/test").Page,
  data: {
    description: string
    date: string
    accountId: string
    categoryId: string
  }
) {
  const response = await page.request.post("/api/transactions", {
    data: {
      description: data.description,
      amount: 25,
      type: "EXPENSE",
      date: data.date,
      accountId: data.accountId,
      categoryId: data.categoryId,
    },
  })
  expect(response.ok()).toBeTruthy()
}

test.describe("Transactions filters, pagination and inline recategorization", () => {
  test("paginates, filters by date range and recategorizes a transaction", async ({
    page,
  }) => {
    await login(page)

    const account = await createAccount(page)
    const alimentacion = await getExpenseCategory(page, "Alimentación")
    const transporte = await getExpenseCategory(page, "Transporte")

    // 13 transactions inside January (for the date filter) + 1 outside it
    // (in March, so it sorts first and always lands on page 1).
    for (let day = 1; day <= 13; day += 1) {
      await createTransaction(page, {
        description: `Movimiento enero ${day}`,
        date: `2026-01-${String(day).padStart(2, "0")}`,
        accountId: account.id,
        categoryId: alimentacion.id,
      })
    }
    await createTransaction(page, {
      description: "Fuera de rango",
      date: "2026-03-15",
      accountId: account.id,
      categoryId: alimentacion.id,
    })

    await page.goto("/patrimonio")
    await page.getByRole("tab", { name: "Movimientos" }).click()

    // --- Pagination: 14 transactions, 10 per page -> 2 pages ---
    await expect(page.getByText("14 transacciones recientes")).toBeVisible()
    await expect(page.getByText("Página 1 de 2")).toBeVisible()
    await expect(page.getByRole("button", { name: "Anterior" })).toBeDisabled()

    await page.getByRole("button", { name: "Siguiente" }).click()
    await expect(page.getByText("Página 2 de 2")).toBeVisible()
    await expect(page.getByRole("button", { name: "Siguiente" })).toBeDisabled()

    await page.getByRole("button", { name: "Anterior" }).click()
    await expect(page.getByText("Página 1 de 2")).toBeVisible()

    // --- Date range filter: only the 13 January transactions ---
    await page.getByRole("button", { name: "Filtrar por fecha" }).click()
    await page.getByLabel("Desde").fill("2026-01-01")
    await page.getByLabel("Hasta").fill("2026-01-31")
    await page.getByRole("button", { name: "Aplicar" }).click()

    await expect(page.getByText("13 transacciones recientes")).toBeVisible()
    await expect(
      page.getByRole("cell", { name: "Fuera de rango" })
    ).toHaveCount(0)

    // --- Inline recategorization ---
    const row = page.getByRole("row", { name: /Movimiento enero 13/ })
    await row.getByLabel("Categoría").click()
    await page.getByRole("option", { name: "Transporte" }).click()

    await expect(row.getByLabel("Categoría")).toContainText("Transporte")

    await page.reload()
    await page.getByRole("tab", { name: "Movimientos" }).click()
    const reloadedRow = page.getByRole("row", { name: /Movimiento enero 13/ })
    await expect(reloadedRow.getByLabel("Categoría")).toContainText(
      transporte.name
    )
  })
})
