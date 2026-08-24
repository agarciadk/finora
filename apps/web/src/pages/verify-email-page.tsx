import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { api } from "@/lib/api"

type VerificationStatus = "loading" | "success" | "error"

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "error"
  )
  // Guards against StrictMode's double-invoke firing this single-use token twice.
  const requestedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || requestedTokenRef.current === token) {
      return
    }
    requestedTokenRef.current = token

    // No abort-on-cleanup here on purpose: StrictMode's synthetic
    // unmount/remount would cancel this same in-flight, deduped
    // request and leave the page stuck on "loading" forever.
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [token])

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-xl font-medium">
            {t("verifyEmail.title")}
          </h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {status === "loading" && (
            <>
              <Loader2
                className="size-8 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
              <CardDescription>{t("verifyEmail.loading")}</CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2
                className="size-8 text-primary"
                aria-hidden="true"
              />
              <CardDescription>{t("verifyEmail.success")}</CardDescription>
              <Link to="/login" className="text-sm underline underline-offset-4">
                {t("verifyEmail.loginLink")}
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle
                className="size-8 text-destructive"
                aria-hidden="true"
              />
              <CardDescription>{t("verifyEmail.error")}</CardDescription>
              <Link to="/login" className="text-sm underline underline-offset-4">
                {t("verifyEmail.loginLink")}
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
