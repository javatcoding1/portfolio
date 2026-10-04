"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { useSound } from "@/hooks/soundcn/use-sound"
import { laserSmall001Sound } from "@/lib/soundcn/laser-small-001"
import { cn } from "@/lib/utils"

/**
 * Shared copy-to-clipboard button used by `<CodeBlock>`,
 * `<PackageInstall>`, and the in-article heading anchor (see
 * `components/mdx/mdx.tsx`).
 *
 * - Default look: subtle square button with a copy icon. Callers can
 *   override the idle icon (e.g. `LinkIcon` for the heading anchor).
 * - After click: swaps to a check icon for 1.5s.
 * - Plays a short laser "pew" sound at low volume. `interrupt: true`
 *   so rapid copies don't overlap. Respects `prefers-reduced-motion`.
 * - Silently no-ops if the clipboard API is unavailable (insecure
 *   context, permission denial, document not focused).
 *
 * `text` can be a string OR a `() => string` thunk. The thunk form
 * exists specifically for the heading anchor, which needs to read
 * `window.location.href` at click time (not render time) so it copies
 * the CURRENT page's URL with the section hash appended.
 */
export function CopyButton({
  text,
  className,
  label = "Copy code",
  copiedLabel = "Copied to clipboard",
  idleIcon,
}: {
  text: string | (() => string)
  className?: string
  label?: string
  copiedLabel?: string
  /** Optional override for the default `<Copy>` icon. Rendered when
   *  the button is idle; the check icon still swaps in after click. */
  idleIcon?: React.ReactNode
}) {
  const [copied, setCopied] = React.useState(false)
  const [playCopyClick] = useSound(laserSmall001Sound, {
    volume: 0.2,
    interrupt: true,
  })

  const handle = React.useCallback(async () => {
    const value = typeof text === "function" ? text() : text
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      playCopyClick()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }, [text, playCopyClick])

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={copied ? copiedLabel : label}
      title={copied ? "Copied" : "Copy"}
      data-copied={copied || undefined}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground",
        "border border-transparent transition-colors",
        "hover:border-border hover:bg-background hover:text-foreground",
        "focus-visible:border-border focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        idleIcon ?? <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  )
}
