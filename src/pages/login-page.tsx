import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useGravatarUrl } from "@/hooks/use-gravatar-url"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginErrors = {
  email?: string
  password?: string
}

function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {}

  if (!email.trim()) {
    errors.email = "Introduce tu correo electrónico."
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Introduce un correo electrónico válido."
  }

  if (!password) {
    errors.password = "Introduce tu contraseña."
  } else if (password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres."
  }

  return errors
}

function WelcomeBackCard() {
  const navigate = useNavigate()
  const { rememberedUser, login, forgetRememberedUser } = useAuth()
  const avatarUrl = useGravatarUrl(rememberedUser?.email ?? "")

  if (!rememberedUser) {
    return null
  }

  function handleQuickLogin(email: string) {
    login(email, true)
    navigate("/", { replace: true })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-xl font-medium">
          Bienvenido de nuevo, {rememberedUser.name}
        </h1>
        <CardDescription>
          Inicia sesión para continuar en tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Badge
          variant="secondary"
          className="h-auto w-fit gap-2 rounded-full py-1 pr-3 pl-1"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${rememberedUser.name}`}
              className="size-5 rounded-full"
            />
          ) : (
            <Skeleton className="size-5 rounded-full" />
          )}
          <span className="font-normal">{rememberedUser.email}</span>
        </Badge>
        <Button onClick={() => handleQuickLogin(rememberedUser.email)}>
          Iniciar sesión
        </Button>
        <Button variant="ghost" onClick={forgetRememberedUser}>
          ¿No eres tú? Usa otra cuenta
        </Button>
      </CardContent>
    </Card>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(email, password)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      login(email, rememberMe)
      navigate("/", { replace: true })
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="font-heading text-xl font-medium">
          Inicia sesión en finora
        </h1>
        <CardDescription>
          Introduce tus credenciales para acceder a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
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
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="remember-me" className="font-normal">
              Recordar mi sesión
            </Label>
          </div>
          <Button type="submit" className="mt-2">
            Iniciar sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function LoginPage() {
  const { rememberedUser } = useAuth()

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      {rememberedUser ? <WelcomeBackCard /> : <LoginForm />}
    </main>
  )
}
