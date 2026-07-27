import i18next from "i18next"
import { initReactI18next } from "react-i18next"

import es from "@/i18n/locales/es/translation.json"
import en from "@/i18n/locales/en/translation.json"

export const defaultNS = "translation"

export const resources = {
  es: {
    translation: es,
  },
  en: {
    translation: en,
  },
} as const

export type SupportedLanguage = keyof typeof resources

export const supportedLanguages = Object.keys(resources) as SupportedLanguage[]

const LANGUAGE_STORAGE_KEY = "finora_language"

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (supportedLanguages as string[]).includes(value)
}

function detectInitialLanguage(): SupportedLanguage {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (storedLanguage && isSupportedLanguage(storedLanguage)) {
    return storedLanguage
  }

  const browserLanguages = navigator.languages ?? [navigator.language]

  for (const browserLanguage of browserLanguages) {
    const primarySubtag = browserLanguage.split("-")[0].toLowerCase()

    if (isSupportedLanguage(primarySubtag)) {
      return primarySubtag
    }
  }

  return "es"
}

void i18next.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "es",
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
})

i18next.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
})

export default i18next
