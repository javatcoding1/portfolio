import React from "react"

import { cn } from "@/lib/utils"

/**
 * Skill / tech chip. Ported from chanhdai's `components/ui/tag.tsx` — used by
 * Experiences, Education, and Projects panels.
 *
 * Rounded-FULL pill (not rounded-md), `bg-zinc-50` in light / `bg-zinc-900` in
 * dark, monospace small text, muted-foreground color. Don't replace with the
 * earlier square `bg-muted/50` chip — the visual rhythm depends on this shape.
 */
export function Tag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex items-center rounded-full border bg-zinc-50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground dark:bg-zinc-900",
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  )
}
