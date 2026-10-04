"use client"

import { useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

/**
 * Wires ←/→ arrow keys to navigate between blog posts. Mirrors chanhdai's
 * `DocKeyboardShortcuts`. Renders nothing; just sets up listeners so the
 * tooltip-hinted shortcuts on the prev/next chip buttons actually work.
 *
 * Respects `event.defaultPrevented` so we don't hijack the arrow keys when
 * focus is inside an input, code block, etc.
 */
export function DocKeyboardShortcuts({
  previous,
  next,
}: {
  previous: string | null
  next: string | null
}) {
  const router = useRouter()

  useHotkeys("ArrowRight", (event) => {
    if (event.defaultPrevented) return
    if (next) router.push(next)
  })

  useHotkeys("ArrowLeft", (event) => {
    if (event.defaultPrevented) return
    if (previous) router.push(previous)
  })

  return null
}
