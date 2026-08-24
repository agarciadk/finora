import { type SubmitEvent, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { ApiError } from "@/lib/api"
import type { SessionEndReason } from "@/lib/session-events"
import i18n from "@/i18n/config"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginErrors = {
  email?: string
  password?: string
  form?: string
}

function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {}

  if (!email.trim()) {
    errors.email = i18n.t("login.errors.emailRequired")
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = i18n.t("login.errors.emailInvalid")
  }

  if (!password) {
    errors.password = i18n.t("login.errors.passwordRequired")
  } else if (password.length < 8) {
    errors.password = i18n.t("login.errors.passwordTooShort")
  }

  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasShownSessionToastRef = useRef(false)

  useEffect(() => {
    if (hasShownSessionToastRef.current) {
      return
    }
    hasShownSessionToastRef.current = true

    const state = location.state as { reason?: SessionEndReason } | null
    if (!state?.reason) {
      return
    }

    toast(
      t(
        state.reason === "idle"
          ? "session.idleEnded"
          : "session.expired"
      )
    )
    // Clear the router state so the toast doesn't reappear on a later visit
    // to /login (e.g. after pressing the browser's back button).
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate, t])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(email, password)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await login(email.trim(), password, rememberMe)
      navigate("/", { replace: true })
    } catch (error) {
      let formError = t("common.errors.generic")

      if (error instanceof ApiError) {
        formError =
          error.message === "EMAIL_NOT_VERIFIED"
            ? t("login.errors.emailNotVerified")
            : t("login.errors.invalidCredentials")
      }

      setErrors({ form: formError })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="font-heading text-xl font-medium">
            {t("login.title")}
          </h1>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("login.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t("login.passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                aria-invalid={Boolean(errors.password)}
                onChange={(event) => setPassword(event.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              <Link
                to="/recuperar-password"
                className="text-sm text-muted-foreground underline underline-offset-4"
              >
                {t("login.forgotPasswordLink")}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember-me" className="font-normal">
                {t("login.rememberMe")}
              </Label>
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
                t("login.submit")
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/registro" className="underline underline-offset-4">
              {t("login.registerLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
