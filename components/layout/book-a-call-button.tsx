"use client"

import { useEffect } from "react"
import { getCalApi } from "@calcom/embed-react"
import { useTheme } from "next-themes"

import { PROFILE } from "@/config/profile"

const NAMESPACE = "book-a-call"

/**
 * Extracts the cal.com slug from `PROFILE.bookingUrl` for the embed.
 * The embed SDK wants just the path part (e.g. `vijay-gatla` or
 * `vijay-gatla/30min`), not the full `https://cal.com/...` URL.
 */
function calLinkFromUrl(url: string | undefined): string | null {
  if (!url) return null
  const match = url.match(/^https?:\/\/cal\.com\/(.+?)\/?$/)
  return match ? match[1]! : null
}

/**
 * "Book a call" button — opens cal.com as an OVERLAY MODAL on this site
 * (NOT a redirect to cal.com). Powered by the official Cal.com React
 * embed SDK (`@calcom/embed-react`) — Cal handles the modal chrome,
 * iframe sandbox, postMessage handshake, and responsive sizing.
 *
 * Wiring (matches cal.com's documented React pattern):
 *   - `cal("ui", { theme, layout })` is called in `useEffect` to push
 *     the user's CURRENT theme into the embed namespace. Re-runs when
 *     `resolvedTheme` changes so the modal stays in sync if the user
 *     toggles the site theme.
 *   - `data-cal-link` + `data-cal-namespace` data-attributes wire the
 *     button into Cal's global click handler — clicking pops the modal.
 *   - `data-cal-config` is intentionally STATIC (no theme inside it)
 *     so the server-rendered HTML matches the client-rendered HTML
 *     EXACTLY. Putting `theme` here caused a React 19 hydration mismatch
 *     because `useTheme()` returns `undefined` during SSR but the
 *     resolved value on the client.
 *
 * Reads the booking URL from `config/profile.ts → PROFILE.bookingUrl`,
 * extracts the slug, and returns `null` (renders nothing) if there's no
 * booking URL set.
 */
export function BookACallButton({
  className,
  children,
  ariaLabel = "Book a call",
}: {
  className?: string
  children: React.ReactNode
  ariaLabel?: string
}) {
  const { resolvedTheme } = useTheme()
  const calLink = calLinkFromUrl(PROFILE.bookingUrl)

  useEffect(() => {
    if (!calLink) return
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace: NAMESPACE })
      if (cancelled) return
      // Theme is pushed via the embed UI API — NOT via `data-cal-config`
      // — so the button's HTML stays identical between SSR and client
      // (no hydration mismatch). Defaults to "light" when the theme
      // hasn't resolved yet (first paint on the client).
      cal("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      })
    })()
    return () => {
      cancelled = true
    }
  }, [calLink, resolvedTheme])

  if (!calLink) return null

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-cal-link={calLink}
      data-cal-namespace={NAMESPACE}
      // STATIC config only — no theme here (see comment above).
      data-cal-config='{"layout":"month_view"}'
      className={className}
    >
      {children}
    </button>
  )
}
