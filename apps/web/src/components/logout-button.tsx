import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function LogoutButton() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { t } = useTranslation()

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon">
            <LogOut />
            <span className="sr-only">{t("logout.trigger")}</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("logout.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            {t("logout.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("logout.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            {t("logout.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
