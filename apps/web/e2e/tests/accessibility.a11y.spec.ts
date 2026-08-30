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
  { name: "categorias", path: "/categorias" },
  { name: "transacciones", path: "/transacciones" },
  { name: "presupuestos", path: "/presupuestos" },
  { name: "recurrentes", path: "/recurrentes" },
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

  test("the register page has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/registro")

    await expectNoViolations(new AxeBuilder({ page }))
  })

  test("the forgot-password page has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/recuperar-password")

    await expectNoViolations(new AxeBuilder({ page }))
  })

  test("the reset-password page has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/restablecer-password?token=not-a-real-token")

    await expectNoViolations(new AxeBuilder({ page }))
  })

  test("the verify-email page has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/verificar-email?token=not-a-real-token")
    await expect(page.getByText("no es válido o ha caducado")).toBeVisible()

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

  test("the import transactions dialog has no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await login(page)
    await page.request.post("/api/accounts", {
      data: {
        name: "Cuenta de pruebas",
        bank: "Banco de pruebas",
        type: "CHECKING",
        balance: 0,
      },
    })
    await page.goto("/transacciones")
    await page.getByRole("button", { name: "Importar movimientos" }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    // Let the sheet's opening transition finish; scanning mid-transition
    // reports transient (and misleading) contrast ratios.
    await page.waitForTimeout(250)

    await expectNoViolations(new AxeBuilder({ page }))
  })
})
