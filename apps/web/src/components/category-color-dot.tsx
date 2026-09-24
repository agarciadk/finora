import { cn } from "@/lib/utils"

type CategoryColorDotProps = {
  color: string | null | undefined
  className?: string
}

// Neutral fallback for categories without an explicit color.
const DEFAULT_COLOR = "var(--muted-foreground)"

export function CategoryColorDot({ color, className }: CategoryColorDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color ?? DEFAULT_COLOR }}
    />
  )
}
