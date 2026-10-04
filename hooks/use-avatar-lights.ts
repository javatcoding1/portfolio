"use client"

import { useCallback, useState } from "react"

/**
 * Avatar Lights state — chanhdai-pattern port. Tracks an "on"/"off" flag
 * for the avatar's interactive lights effect (click avatar to toggle).
 *
 *   - State is persisted to `localStorage` under `avatarLights`.
 *   - The flag is mirrored to `document.documentElement.dataset.avatarLights`
 *     so CSS can react via Tailwind's `in-[[data-avatar-lights=off]]:*`
 *     selectors WITHOUT requiring the consumer component to re-render.
 *   - A blocking inline `<script>` in `app/layout.tsx` sets the
 *     `data-avatar-lights` attribute BEFORE first paint (same anti-flash
 *     trick chanhdai uses for theme + this lights state).
 *
 * Default state: "on". Press `L` to toggle anywhere on the page (the
 * `useHotkeys` binding lives in the consumer component to keep this hook
 * dependency-free).
 */
export type AvatarLightsState = "on" | "off"

const STORAGE_KEY = "avatarLights"
const DATA_ATTR = "avatarLights" // becomes `data-avatar-lights` on <html>

function readPersisted(): AvatarLightsState {
  if (typeof window === "undefined") return "on"
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return "on"
    const parsed = JSON.parse(raw)
    return parsed === "off" ? "off" : "on"
  } catch {
    return "on"
  }
}

function writePersisted(value: AvatarLightsState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // localStorage might be unavailable (private mode, quota exceeded) — fail silently.
  }
}

function applyAttr(value: AvatarLightsState) {
  if (typeof document === "undefined") return
  document.documentElement.dataset[DATA_ATTR] = value
}

export function useAvatarLights() {
  const [lights, setLights] = useState<AvatarLightsState>(readPersisted)

  const toggleLights = useCallback(() => {
    setLights((prev) => {
      const next: AvatarLightsState = prev === "on" ? "off" : "on"
      writePersisted(next)
      applyAttr(next)
      return next
    })
  }, [])

  const setLightsTo = useCallback((value: AvatarLightsState) => {
    setLights(value)
    writePersisted(value)
    applyAttr(value)
  }, [])

  return { lights, toggleLights, setLights: setLightsTo }
}
