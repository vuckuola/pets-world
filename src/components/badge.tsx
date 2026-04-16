import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default"|"secondary"|"destructive"|"outline" }>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "bg-primary/15 text-primary border-primary/20",
      secondary: "bg-secondary text-muted-foreground border-border",
      destructive: "bg-destructive/15 text-destructive border-destructive/20",
      outline: "border-border text-muted-foreground",
    }
    return <div ref={ref} className={cn("inline-flex items-center rounded-[2px] border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.05em] transition-colors", variants[variant], className)} {...props} />
  }
)
Badge.displayName = "Badge"
export { Badge }
