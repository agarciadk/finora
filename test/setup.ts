import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import i18n from "@/i18n/config"

// Ensure unit tests always run in Spanish, regardless of the test
// environment's detected browser language.
await i18n.changeLanguage("es")

afterEach(() => {
  cleanup()
})
