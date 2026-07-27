import { useEffect, useState } from "react"

async function sha256Hex(message: string) {
  const data = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export function useGravatarUrl(email: string, size = 80) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const normalizedEmail = email.trim().toLowerCase()

    sha256Hex(normalizedEmail).then((hash) => {
      if (!isCancelled) {
        setUrl(`https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [email, size])

  return url
}
