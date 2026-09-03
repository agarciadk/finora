import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

// Simple full-area fallback used while a lazy-loaded route chunk is fetched.
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn("flex h-full w-full items-center justify-center py-16", className)}
    >
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
    </div>
  )
}
