/**
 * Returns the time-of-day greeting word based on a Date in the given IANA
 * timezone. Used by the home page's "Good ___" intro panel.
 *
 * Conversational cutoffs (NOT strict astronomical ones — "good evening"
 * still feels right at 1 AM):
 *   05:00–11:59  → morning
 *   12:00–16:59  → afternoon
 *   17:00–04:59  → evening (wraps through late night and pre-dawn)
 */
export function getTimeOfDayGreeting(
  now: Date = new Date(),
  timeZone?: string
): "morning" | "afternoon" | "evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(now)
  )

  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  return "evening"
}
