import { Trans, useTranslation } from "react-i18next"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"

type IdleWarningModalProps = {
  open: boolean
  remainingSeconds: number
  onStay: () => void
}

// Mounted once inside DashboardLayout so it applies to every private route.
export function IdleWarningModal({
  open,
  remainingSeconds,
  onStay,
}: IdleWarningModalProps) {
  const { t } = useTranslation()
  const { endSession } = useAuth()

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Dismissing without an explicit choice (e.g. Escape) is treated as
        // "I'm still here" - it's the safer default than logging out.
        if (!next) {
          onStay()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("session.idleWarning.title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            <Trans
              i18nKey="session.idleWarning.description"
              values={{ seconds: remainingSeconds }}
              components={{ strong: <strong className="text-foreground" /> }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => void endSession("idle")}>
            {t("session.idleWarning.logout")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onStay}>
            {t("session.idleWarning.stay")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
