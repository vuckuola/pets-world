import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn("flex h-10 w-full rounded-[4px] border border-input bg-muted px-4 py-3 text-sm text-foreground transition-colors placeholder:text-[#666666] focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />
  )
)
Input.displayName = "Input"
export { Input }
