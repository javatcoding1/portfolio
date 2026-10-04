import Link from "next/link"

import { cn } from "@/lib/utils"
import { JMMark } from "@/components/layout/jm-mark"

/**
 * Site brand mark in the header — pixel-art JM monogram for E Jayanth Madhav.
 * Rendered as inline SVG with `currentColor` so it flips cleanly
 * between light/dark themes without swapping asset files.
 */
export function SiteMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={cn("inline-flex items-center", className)}
    >
      <JMMark className="size-8" />
    </Link>
  )
}
