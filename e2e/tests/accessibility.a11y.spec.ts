import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(" ")).join(", ")
      return `[${violation.impact}] ${violation.id}: ${violation.help} (${targets})`
    })
    .join("\n")
}

async function expectNoViolations(builder: AxeBuilder) {
  const { violations } = await builder.analyze()

  expect(violations, formatViolations(violations)).toEqual([])
}

const authenticatedRoutes = [
  { name: "dashboard", path: "/" },
  { name: "cuentas", path: "/cuentas" },
  { name: "transacciones", path: "/transacciones" },
  { name: "presupuestos", path: "/presupuestos" },
  { name: "analitica", path: "/analitica" },
  { name: "ajustes", path: "/ajustes" },
]

test.describe("Accessibility", () => {
  test("the login page has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/login")

    await expectNoViolations(new AxeBuilder({ page }))
  })

  for (const { name, path } of authenticatedRoutes) {
    test(`the ${name} page has no automatically detectable accessibility issues`, async ({
      page,
    }) => {
      await login(page)
      await page.goto(path)

      await expectNoViolations(new AxeBuilder({ page }))
    })
  }

  test("the welcome back card has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await login(page, { email: "ada.lovelace@example.com", rememberMe: true })
    await page.getByRole("button", { name: "Cerrar sesión" }).click()
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cerrar sesión" })
      .click()

    await expect(
      page.getByText("Bienvenido de nuevo, Ada Lovelace")
    ).toBeVisible()

    await expectNoViolations(new AxeBuilder({ page }))
  })

  test("the logout confirmation dialog has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await login(page)
    await page.getByRole("button", { name: "Cerrar sesión" }).click()

    await expect(page.getByRole("alertdialog")).toBeVisible()

    await expectNoViolations(new AxeBuilder({ page }))
  })
})
