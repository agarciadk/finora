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
  { name: "patrimonio", path: "/patrimonio" },
  { name: "planificacion", path: "/planificacion" },
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
      // Authenticated routes are React.lazy-loaded: wait past the
      // <Suspense> fallback (no heading) for the real page to mount before
      // scanning, or axe flags the transient loading state instead.
      await expect(page.locator("h1")).toBeVisible()

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
    await page.goto("/patrimonio")
    await page.getByRole("tab", { name: "Movimientos" }).click()
    await page.getByRole("button", { name: "Importar movimientos" }).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    // Let the sheet's opening transition finish; scanning mid-transition
    // reports transient (and misleading) contrast ratios.
    await page.waitForTimeout(250)

    await expectNoViolations(new AxeBuilder({ page }))
  })
})
