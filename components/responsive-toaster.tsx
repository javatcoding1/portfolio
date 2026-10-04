"use client"

import { useSyncExternalStore } from "react"

import { Toaster } from "@/components/ui/sonner"

/**
 * Wrapper around shadcn's `<Toaster>` that swaps `position` responsively:
 * `bottom-center` on mobile (<640px = the sm breakpoint), `bottom-right`
 * on desktop. Sonner's `position` prop is a single string, so we listen
 * to `(min-width: 640px)` and re-render when it flips.
 *
 * Colors: plain popover-styled toasts (no `richColors`). Chanhdai's pattern
 * - the check icon carries the semantic meaning; the toast surface stays
 * neutral so it doesn't visually shout.
 */
export function ResponsiveToaster() {
  const isDesktop = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 640px)")
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => false
  )

  return (
    <Toaster position={isDesktop ? "bottom-right" : "bottom-center"} />
  )
}
