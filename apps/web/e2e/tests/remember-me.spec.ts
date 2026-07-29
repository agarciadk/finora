import { expect, test } from "@playwright/test"

import { login } from "./support/auth"

test.describe("Remember me", () => {
  test("persists the refresh token cookie across browser restarts when checked", async ({
    page,
    context,
  }) => {
    await login(page, { rememberMe: true })
    await expect(page).toHaveURL(/\/$/)

    const refreshCookie = (await context.cookies()).find(
      (cookie) => cookie.name === "refresh_token"
    )

    expect(refreshCookie).toBeDefined()
    // A session-only cookie reports expires as -1; "remember me" must persist it.
    expect(refreshCookie?.expires).toBeGreaterThan(0)
  })

  test("uses a session-only refresh token cookie when not checked", async ({
    page,
    context,
  }) => {
    await login(page, { rememberMe: false })
    await expect(page).toHaveURL(/\/$/)

    const refreshCookie = (await context.cookies()).find(
      (cookie) => cookie.name === "refresh_token"
    )

    expect(refreshCookie).toBeDefined()
    expect(refreshCookie?.expires).toBe(-1)
  })
})
