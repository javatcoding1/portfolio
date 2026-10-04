"use client"

import Image from "next/image"
import { useHotkeys } from "react-hotkeys-hook"

import { useAvatarLights } from "@/hooks/use-avatar-lights"
import { cn } from "@/lib/utils"

/**
 * Interactive avatar with chanhdai-style "lights toggle" — click the
 * photo (or press `L`) to toggle theme-aware lighting on the image.
 *
 * Chanhdai's original uses FOUR pre-rendered variants
 * (lightOff/lightOn/darkOff/darkOn) cross-faded by opacity. We achieve
 * the same vibe with a SINGLE image and CSS `filter` transitions —
 * trivially editable (swap one URL in `config/profile.ts`) and free of
 * extra asset roundtrips.
 *
 * Filter recipe:
 *   - LIGHT mode + lights ON  : `brightness(1.05) saturate(1.1)` (slightly punchier)
 *   - LIGHT mode + lights OFF : unfiltered (the room's daylight still works)
 *   - DARK  mode + lights ON  : unfiltered (default "night, lamp on" look)
 *   - DARK  mode + lights OFF : `brightness(0.45) saturate(0.5)` (room goes dark, photo dims)
 *
 * The `in-[…]:` Tailwind selectors target an ancestor that matches
 * `.light[data-avatar-lights=off]` / `.dark[data-avatar-lights=off]` etc.
 * `next-themes` writes the theme as a class on `<html>`, and the
 * `useAvatarLights` hook + pre-hydration script write
 * `data-avatar-lights` on the same element — so the cascade resolves on
 * the FIRST paint without flash.
 */
export function AvatarLights({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const { toggleLights } = useAvatarLights()

  // `L` (lowercase, anywhere) toggles the lights — chanhdai's same hotkey.
  // Skip when typing in an input so we don't intercept regular text entry.
  useHotkeys("l", toggleLights, { enableOnFormTags: false })

  return (
    <button
      type="button"
      onClick={toggleLights}
      aria-label="Toggle avatar lights (L)"
      className={cn(
        // Sizes match chanhdai exactly: 120/128/160px (size-30 → size-32
        // → size-40) so the photo carries the same visual weight as the
        // name beside it. NO `border-line` — that draws a hard line that
        // visibly extends past the photo edge; the inner `inset-ring-1
        // inset-ring-foreground/10` below provides the subtle rim instead.
        "group/avatar relative size-30 shrink-0 overflow-hidden rounded-full outline-none min-[24rem]:size-32 sm:size-40",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Cursor stays interactive but NO hover-scale transform. Chanhdai
        // and wizaye.is-a.dev both keep the avatar rock-still on hover —
        // the interactivity is signaled by the cursor + focus ring alone.
        "cursor-pointer",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        // Matches the responsive sizes above so Next ships a crisp
        // bitmap at each breakpoint (120 → 128 → 160).
        sizes="(min-width: 640px) 160px, (min-width: 384px) 128px, 120px"
        priority
        className={cn(
          "object-cover select-none transition-[filter] duration-700 ease-[cubic-bezier(0.42,0,0.58,1)]",
          // Light mode — lights ON: punch up brightness/saturation slightly.
          "in-[.light[data-avatar-lights=on]]:brightness-105",
          "in-[.light[data-avatar-lights=on]]:saturate-110",
          // Dark mode — lights OFF: dim the photo dramatically (room is dark).
          "in-[.dark[data-avatar-lights=off]]:brightness-50",
          "in-[.dark[data-avatar-lights=off]]:saturate-50"
        )}
      />

      {/* Subtle inset rim. Matches chanhdai's `inset-ring-foreground/10`. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full inset-ring-1 inset-ring-foreground/10"
      />
    </button>
  )
}
