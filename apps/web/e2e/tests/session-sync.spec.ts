import { expect, test } from "@playwright/test"

import { login, registerVerifiedUser } from "./support/auth"

test.describe("Session sync with the backend", () => {
  test("expiresAt reflects the real access token lifespan and /auth/refresh rotates both tokens forward", async ({
    page,
  }) => {
    const { email, password } = await registerVerifiedUser(page)

    const loginResponse = await page.request.post("/api/auth/login", {
      data: { email, password, rememberMe: true },
    })
    const loginBody = (await loginResponse.json()) as { expiresAt: string }
    const loginExpiresAt = new Date(loginBody.expiresAt).getTime()

    // The backend's access token TTL is 5 minutes (apps/api/src/auth/cookie.util.ts).
    // Asserting a range (not the exact value) keeps this test from becoming a
    // second place to update if that TTL is ever tuned.
    const msSinceLogin = loginExpiresAt - Date.now()
    expect(msSinceLogin).toBeGreaterThan(4 * 60 * 1000)
    expect(msSinceLogin).toBeLessThanOrEqual(5 * 60 * 1000 + 5000)

    const cookiesBefore = await page.context().cookies()
    const accessTokenBefore = cookiesBefore.find(
      (cookie) => cookie.name === "access_token"
    )
    const refreshTokenBefore = cookiesBefore.find(
      (cookie) => cookie.name === "refresh_token"
    )
    expect(accessTokenBefore).toBeDefined()
    expect(refreshTokenBefore).toBeDefined()

    // JWT `exp`/`iat` only have 1-second resolution: without this wait, a
    // refresh issued within the same wall-clock second as login would mint
    // an identical expiresAt, and the "strictly later" assertion below would
    // be flaky.
    await page.waitForTimeout(1100)

    const refreshResponse = await page.request.post("/api/auth/refresh")
    expect(refreshResponse.ok()).toBe(true)
    const refreshBody = (await refreshResponse.json()) as { expiresAt: string }
    const refreshExpiresAt = new Date(refreshBody.expiresAt).getTime()

    expect(refreshExpiresAt).toBeGreaterThan(loginExpiresAt)

    const cookiesAfter = await page.context().cookies()
    const accessTokenAfter = cookiesAfter.find(
      (cookie) => cookie.name === "access_token"
    )
    const refreshTokenAfter = cookiesAfter.find(
      (cookie) => cookie.name === "refresh_token"
    )

    // A fresh access token was minted...
    expect(accessTokenAfter?.value).not.toBe(accessTokenBefore?.value)
    // ...the (rotating) refresh token was replaced...
    expect(refreshTokenAfter?.value).not.toBe(refreshTokenBefore?.value)
    // ...and, since "remember me" was on, its cookie carries a concrete
    // expiry that slides forward with every rotation (proving the backing
    // Session row's expiresAt - set to the same value - slides too, see
    // AuthService#rotateSession).
    expect(refreshTokenAfter?.expires).toBeGreaterThan(
      refreshTokenBefore?.expires ?? 0
    )
  })

  test("proactively refreshes the session before the access token actually expires, while the user is active", async ({
    page,
  }) => {
    // Rewrite only the JSON body's `expiresAt` of the real login response
    // (the real Set-Cookie headers are untouched) so the heartbeat's 60s
    // lead window (use-session-heartbeat.ts) is already in the past, and it
    // fires almost immediately instead of requiring a real ~4 minute wait.
    await page.route("**/api/auth/login", async (route) => {
      const response = await route.fetch()
      const json = (await response.json()) as { expiresAt: string }
      json.expiresAt = new Date(Date.now() + 10_000).toISOString()
      await route.fulfill({ response, json })
    })

    await login(page)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText("Saldo total")).toBeVisible()

    const refreshTokenBefore = (await page.context().cookies()).find(
      (cookie) => cookie.name === "refresh_token"
    )?.value
    expect(refreshTokenBefore).toBeDefined()

    // Nudge activity so the heartbeat's "has the user done anything
    // recently?" check passes (it also stamps activity on mount, but this
    // keeps the test's intent explicit).
    await page.mouse.move(100, 100)

    // The refresh token can only rotate through a genuine, successful
    // /auth/refresh round-trip against the real backend - this is the
    // observable proof that the frontend refreshed on its own.
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies()
          return cookies.find((cookie) => cookie.name === "refresh_token")
            ?.value
        },
        { timeout: 10_000 }
      )
      .not.toBe(refreshTokenBefore)

    // The session must stay alive throughout: no forced logout/redirect.
    await expect(page).toHaveURL(/\/$/)
  })
})
