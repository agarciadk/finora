import { useState } from "react"
import { useTranslation } from "react-i18next"
import { UAParser } from "ua-parser-js"
import { Laptop, Loader2, Smartphone, Tablet } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useSessions } from "@/hooks/use-sessions"

function DeviceIcon({ userAgent }: { userAgent: string | null }) {
  const deviceType = userAgent ? new UAParser(userAgent).getDevice().type : undefined

  if (deviceType === "mobile") {
    return <Smartphone className="size-5 shrink-0 text-muted-foreground" />
  }
  if (deviceType === "tablet") {
    return <Tablet className="size-5 shrink-0 text-muted-foreground" />
  }
  return <Laptop className="size-5 shrink-0 text-muted-foreground" />
}

function DeviceLabel({ userAgent }: { userAgent: string | null }) {
  const { t } = useTranslation()

  if (!userAgent) {
    return <>{t("settings.sessions.unknownDevice")}</>
  }

  const { browser, os } = new UAParser(userAgent).getResult()

  if (!browser.name) {
    return <>{t("settings.sessions.unknownDevice")}</>
  }

  return (
    <>
      {t("settings.sessions.browserOnOs", {
        browser: browser.name,
        os: os.name ?? t("settings.sessions.unknownOs"),
      })}
    </>
  )
}

export function ActiveSessionsCard() {
  const { t, i18n } = useTranslation()
  const { sessions, isLoading, revokeSession, revokeAllOtherSessions } =
    useSessions()
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const [isConfirmingRevokeAll, setIsConfirmingRevokeAll] = useState(false)
  const [isRevokingAll, setIsRevokingAll] = useState(false)

  const hasOtherSessions = sessions.some((session) => !session.isCurrent)

  async function handleRevoke(id: string) {
    setIsRevoking(true)
    try {
      await revokeSession(id)
      setPendingRevokeId(null)
    } finally {
      setIsRevoking(false)
    }
  }

  async function handleRevokeAll() {
    setIsRevokingAll(true)
    try {
      await revokeAllOtherSessions()
      setIsConfirmingRevokeAll(false)
    } finally {
      setIsRevokingAll(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t("settings.sessions.title")}</CardTitle>
          <CardDescription>{t("settings.sessions.description")}</CardDescription>
        </div>
        {hasOtherSessions && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmingRevokeAll(true)}
          >
            {t("settings.sessions.revokeAll")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!isLoading && sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("settings.sessions.empty")}
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between gap-4 rounded-lg border p-4"
          >
            <div className="flex items-start gap-3">
              <DeviceIcon userAgent={session.userAgent} />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    <DeviceLabel userAgent={session.userAgent} />
                  </p>
                  {session.isCurrent && (
                    <Badge variant="secondary">
                      {t("settings.sessions.current")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.ipAddress ?? t("settings.sessions.unknownIp")}
                  {" · "}
                  {t("settings.sessions.lastActive", {
                    date: new Date(session.lastActive).toLocaleString(
                      i18n.language
                    ),
                  })}
                </p>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingRevokeId(session.id)}
              >
                {t("settings.sessions.revoke")}
              </Button>
            )}
          </div>
        ))}
      </CardContent>

      <AlertDialog
        open={pendingRevokeId !== null}
        onOpenChange={(open) => !open && setPendingRevokeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.sessions.confirmRevoke.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.sessions.confirmRevoke.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>
              {t("common.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRevoking}
              aria-disabled={isRevoking}
              onClick={() => pendingRevokeId && void handleRevoke(pendingRevokeId)}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="sr-only">{t("common.loading")}</span>
                </>
              ) : (
                t("settings.sessions.confirmRevoke.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isConfirmingRevokeAll}
        onOpenChange={setIsConfirmingRevokeAll}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.sessions.confirmRevokeAll.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.sessions.confirmRevokeAll.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingAll}>
              {t("common.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRevokingAll}
              aria-disabled={isRevokingAll}
              onClick={() => void handleRevokeAll()}
            >
              {isRevokingAll ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="sr-only">{t("common.loading")}</span>
                </>
              ) : (
                t("settings.sessions.confirmRevokeAll.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
