import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

// Displays an IBAN with only the country code and last 4 digits visible
// (e.g. "ES91 •••• •••• •••• 1332"), masking the rest for privacy.
export function formatIban(iban: string) {
  const clean = iban.replace(/\s+/g, "").toUpperCase()
  if (clean.length <= 8) return clean

  const country = clean.slice(0, 4)
  const last = clean.slice(-4)
  return `${country} •••• •••• •••• ${last}`
}
