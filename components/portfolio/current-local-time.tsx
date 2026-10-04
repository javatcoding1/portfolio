"use client"

import { useEffect, useState } from "react"
import { ClockIcon } from "lucide-react"

import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
} from "./intro-item"

/**
 * Live local-time row for Overview. Shows the time in `timeZone` plus a
 * "Xh ahead/behind" hint vs the visitor's local time.
 *
 * Client-only — server renders an empty shell to avoid hydration mismatch
 * (a user in Tokyo sees a different time than a server in us-east).
 */
export function CurrentLocalTime({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const display = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(now)

  const offset = formatOffset(now, timeZone)

  return (
    <IntroItem>
      <IntroItemIcon>
        <ClockIcon />
      </IntroItemIcon>
      <IntroItemContent>
        <span suppressHydrationWarning>{display}</span>
        {offset && (
          <>
            {" "}
            <span className="text-muted-foreground" suppressHydrationWarning>
              {"//"} {offset}
            </span>
          </>
        )}
      </IntroItemContent>
    </IntroItem>
  )
}

function formatOffset(now: Date, timeZone: string): string {
  // Difference between the visitor's local clock and the profile timeZone,
  // in whole hours. Positive when the profile is AHEAD of the visitor.
  const localHours = now.getHours() + now.getMinutes() / 60
  const targetParts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type === "hour" || p.type === "minute") acc[p.type] = p.value
      return acc
    }, {})
  const targetHours =
    parseInt(targetParts.hour ?? "0", 10) +
    parseInt(targetParts.minute ?? "0", 10) / 60
  let diff = Math.round(targetHours - localHours)
  // Day wraparound — keep diff in (-12, 12].
  if (diff > 12) diff -= 24
  if (diff <= -12) diff += 24

  if (diff === 0) return "same time"
  const abs = Math.abs(diff)
  return `${abs}h ${diff > 0 ? "ahead" : "behind"}`
}
