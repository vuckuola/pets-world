"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<"div"> & { delayDuration?: number }) {
  return (
    <div data-slot="tooltip-provider" {...props} />
  )
}

function Tooltip({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<"button">) {
  return <button data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
}) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
        className
      )}
      style={{
        position: "absolute",
        ...(side === "top" ? { bottom: sideOffset } : {}),
        ...(side === "bottom" ? { top: sideOffset } : {}),
        ...(side === "left" ? { right: sideOffset } : {}),
        ...(side === "right" ? { left: sideOffset } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
