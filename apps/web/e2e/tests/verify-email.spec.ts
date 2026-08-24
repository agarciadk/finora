import { expect, test } from "@playwright/test"

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
}

test.describe("Email verification", () => {
  test("blocks login until the email is verified, then allows it once verified", async ({
    page,
  }) => {
    const email = uniqueEmail()
    const password = "supersecret123"

    const response = await page.request.post("/api/auth/register", {
      data: { name: "Ada Lovelace", email, password },
    })
    const { verificationToken } = (await response.json()) as {
      verificationToken?: string
    }
    expect(verificationToken).toBeTruthy()

    // Attempting to log in before verifying must fail with a clear message.
    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(email)
    await page.getByLabel("Contraseña").fill(password)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await expect(
      page.getByText("Debes verificar tu correo antes de iniciar sesión.")
    ).toBeVisible()

    await page.goto(`/verificar-email?token=${verificationToken}`)
    await expect(
      page.getByText("Tu correo se ha verificado correctamente.", {
        exact: false,
      })
    ).toBeVisible()

    await page.getByRole("link", { name: "Ir a iniciar sesión" }).click()
    await page.getByLabel("Correo electrónico").fill(email)
    await page.getByLabel("Contraseña").fill(password)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL(/\/$/)
  })

  test("shows an error for an invalid or already-used token", async ({
    page,
  }) => {
    await page.goto("/verificar-email?token=not-a-real-token")

    await expect(
      page.getByText("El enlace de verificación no es válido o ha caducado.")
    ).toBeVisible()
  })

  test("registering shows the check-your-email confirmation", async ({
    page,
  }) => {
    await page.goto("/registro")
    await page.getByLabel("Nombre").fill("Ada Lovelace")
    await page.getByLabel("Correo electrónico").fill(uniqueEmail())
    await page.getByLabel("Contraseña", { exact: true }).fill("supersecret123")
    await page
      .getByLabel("Confirma tu contraseña")
      .fill("supersecret123")
    await page.getByRole("button", { name: "Crear cuenta" }).click()

    await expect(page.getByText("Revisa tu correo")).toBeVisible()
  })
})
