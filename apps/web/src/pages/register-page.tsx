import { type SubmitEvent, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { MailCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { ApiError } from "@/lib/api"
import i18n from "@/i18n/config"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HTTP_CONFLICT = 409

type RegisterErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  form?: string
}

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterErrors {
  const errors: RegisterErrors = {}

  if (!name.trim()) {
    errors.name = i18n.t("register.errors.nameRequired")
  }

  if (!email.trim()) {
    errors.email = i18n.t("register.errors.emailRequired")
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = i18n.t("register.errors.emailInvalid")
  }

  if (!password) {
    errors.password = i18n.t("register.errors.passwordRequired")
  } else if (password.length < 8) {
    errors.password = i18n.t("register.errors.passwordTooShort")
  }

  if (password && confirmPassword !== password) {
    errors.confirmPassword = i18n.t("register.errors.passwordMismatch")
  }

  return errors
}

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(name, email, password, confirmPassword)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await register(name.trim(), email.trim(), password)
      setIsRegistered(true)
    } catch (error) {
      const isConflict = error instanceof ApiError && error.status === HTTP_CONFLICT
      setErrors({
        form: isConflict
          ? t("register.errors.emailInUse")
          : t("register.errors.generic"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isRegistered) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <MailCheck className="mb-2 size-8 text-primary" aria-hidden="true" />
            <h1 className="font-heading text-xl font-medium">
              {t("register.checkEmail.title")}
            </h1>
            <CardDescription>
              {t("register.checkEmail.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/login"
              className="text-sm underline underline-offset-4"
            >
              {t("register.checkEmail.loginLink")}
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
            {t("register.title")}
          </h1>
          <CardDescription>{t("register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t("register.nameLabel")}</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("register.namePlaceholder")}
                value={name}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("register.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("register.emailPlaceholder")}
                value={email}
                aria-invalid={Boolean(errors.email)}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t("register.passwordLabel")}</Label>
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
                {t("register.confirmPasswordLabel")}
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
            <Button type="submit" className="mt-2" disabled={isSubmitting}>
              {t("register.submit")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline underline-offset-4">
              {t("register.loginLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
