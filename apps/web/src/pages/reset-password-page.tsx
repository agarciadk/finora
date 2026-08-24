import { type SubmitEvent, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api, ApiError } from "@/lib/api"
import i18n from "@/i18n/config"

type ResetPasswordErrors = {
  password?: string
  confirmPassword?: string
  form?: string
}

function validate(
  password: string,
  confirmPassword: string
): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {}

  if (!password) {
    errors.password = i18n.t("resetPassword.errors.passwordRequired")
  } else if (password.length < 8) {
    errors.password = i18n.t("resetPassword.errors.passwordTooShort")
  }

  if (password && confirmPassword !== password) {
    errors.confirmPassword = i18n.t("resetPassword.errors.passwordMismatch")
  }

  return errors
}

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setErrors({ form: t("resetPassword.errors.invalidToken") })
      return
    }

    const nextErrors = validate(password, confirmPassword)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.post("/auth/reset-password", { token, password })
      setIsSuccess(true)
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError
            ? t("resetPassword.errors.invalidToken")
            : t("common.errors.generic"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <h1 className="font-heading text-xl font-medium">
              {t("resetPassword.successTitle")}
            </h1>
            <CardDescription>
              {t("resetPassword.successDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="text-sm underline underline-offset-4">
              {t("resetPassword.loginLink")}
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
            {t("resetPassword.title")}
          </h1>
          <CardDescription>{t("resetPassword.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                {t("resetPassword.passwordLabel")}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => setPassword(event.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">
                {t("resetPassword.confirmPasswordLabel")}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                aria-invalid={Boolean(errors.confirmPassword)}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            {errors.form && (
              <p className="text-sm text-destructive">{errors.form}</p>
            )}
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
                t("resetPassword.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
