import { Link } from "react-router-dom"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Compass className="size-10 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">404</h1>
        <p className="text-muted-foreground">
          No hemos encontrado la página que buscas.
        </p>
      </div>
      <Button render={<Link to="/" />}>Volver al dashboard</Button>
    </div>
  )
}
