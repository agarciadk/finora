import { type SubmitEvent, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2, MailCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import i18n from "@/i18n/config"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string): string | undefined {
  if (!email.trim()) {
    return i18n.t("forgotPassword.errors.emailRequired")
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return i18n.t("forgotPassword.errors.emailInvalid")
  }
  return undefined
}

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validate(email)
    setEmailError(error)

    if (error) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.post("/auth/forgot-password", { email: email.trim() })
    } catch {
      // Intentionally ignored: the backend always returns the same generic
      // message to avoid leaking which emails are registered.
    } finally {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <MailCheck className="mb-2 size-8 text-primary" aria-hidden="true" />
            <h1 className="font-heading text-xl font-medium">
              {t("forgotPassword.successTitle")}
            </h1>
            <CardDescription>
              {t("forgotPassword.successDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="text-sm underline underline-offset-4">
              {t("forgotPassword.loginLink")}
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-xl font-medium">
            {t("forgotPassword.title")}
          </h1>
          <CardDescription>{t("forgotPassword.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("forgotPassword.emailPlaceholder")}
                value={email}
                aria-invalid={Boolean(emailError)}
                onChange={(event) => setEmail(event.target.value)}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <Button
              type="submit"
              className="mt-2"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="sr-only">{t("common.loading")}</span>
                </>
              ) : (
                t("forgotPassword.submit")
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline underline-offset-4">
              {t("forgotPassword.loginLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
