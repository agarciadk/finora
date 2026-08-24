import { expect, test } from "@playwright/test"

import { registerVerifiedUser } from "./support/auth"

test.describe("Forgot / reset password", () => {
  test("completes the full flow and logs in with the new password", async ({
    page,
  }) => {
    const { email } = await registerVerifiedUser(page)

    await page.goto("/recuperar-password")
    await page.getByLabel("Correo electrónico").fill(email)
    await page.getByRole("button", { name: "Enviar enlace" }).click()

    const forgotResponse = await page.request.post(
      "/api/auth/forgot-password",
      { data: { email } }
    )
    const { resetToken } = (await forgotResponse.json()) as {
      resetToken?: string
    }
    expect(resetToken).toBeTruthy()

    const newPassword = "brandnewsecret123"
    await page.goto(`/restablecer-password?token=${resetToken}`)
    await page.getByLabel("Nueva contraseña", { exact: true }).fill(newPassword)
    await page.getByLabel("Confirma tu nueva contraseña").fill(newPassword)
    await page
      .getByRole("button", { name: "Restablecer contraseña" })
      .click()
    await expect(page.getByText("Contraseña actualizada")).toBeVisible()

    await page.getByRole("link", { name: "Iniciar sesión" }).click()
    await page.getByLabel("Correo electrónico").fill(email)
    await page.getByLabel("Contraseña").fill(newPassword)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL(/\/$/)
  })

  test("shows the same generic confirmation for an unregistered email", async ({
    page,
  }) => {
    await page.goto("/recuperar-password")
    await page.getByLabel("Correo electrónico").fill("nobody@example.com")
    await page.getByRole("button", { name: "Enviar enlace" }).click()

    await expect(page.getByText("Revisa tu correo")).toBeVisible()
  })

  test("shows an error for an invalid or expired reset token", async ({
    page,
  }) => {
    await page.goto("/restablecer-password?token=not-a-real-token")
    await page.getByLabel("Nueva contraseña", { exact: true }).fill("supersecret123")
    await page.getByLabel("Confirma tu nueva contraseña").fill("supersecret123")
    await page
      .getByRole("button", { name: "Restablecer contraseña" })
      .click()

    await expect(
      page.getByText("El enlace no es válido o ha caducado.")
    ).toBeVisible()
  })
})
