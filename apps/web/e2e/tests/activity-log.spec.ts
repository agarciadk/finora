import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

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

async function getExpenseCategory(page: import("@playwright/test").Page) {
  const response = await page.request.get("/api/categories")
  expect(response.ok()).toBeTruthy()
  const categories = (await response.json()) as { id: string; name: string }[]
  const category = categories.find((item) => item.name === "Alimentación")
  if (!category) throw new Error('Category "Alimentación" not found')
  return category
}

async function createTransaction(
  page: import("@playwright/test").Page,
  accountId: string,
  categoryId: string,
  description: string
) {
  const response = await page.request.post("/api/transactions", {
    data: {
      description,
      amount: 25,
      type: "EXPENSE",
      date: "2026-01-15",
      accountId,
      categoryId,
    },
  })
  expect(response.ok()).toBeTruthy()
}

test.describe("Soft delete and activity log", () => {
  test("deleting a transaction hides it from the list and records a DELETE entry in the activity log", async ({
    page,
  }) => {
    await login(page)

    const account = await createAccount(page)
    const category = await getExpenseCategory(page)
    const description = `Movimiento a borrar ${Date.now()}`
    await createTransaction(page, account.id, category.id, description)

    await page.goto("/patrimonio")
    await page.getByRole("tab", { name: "Movimientos" }).click()
    const row = page.getByRole("row", { name: new RegExp(description) })
    await expect(row).toBeVisible()

    await row.getByRole("button").click()
    await page.getByRole("menuitem", { name: "Eliminar" }).click()
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Eliminar" })
      .click()

    await expect(row).not.toBeVisible()

    await page.getByRole("link", { name: "Ajustes" }).click()
    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible()
    await page.getByRole("tab", { name: "Preferencias" }).click()

    const activityRow = page.getByRole("row", { name: /Eliminación/ }).first()
    await expect(activityRow).toBeVisible()
    await expect(activityRow).toContainText("TRANSACTION")
  })
})
