import { unstable_cache } from "next/cache"

import type { Activity } from "@/components/contribution-graph"

type GitHubContributionsResponse = {
  contributions?: Activity[]
}

/**
 * Fetches a year of GitHub contributions for `username` via Jonathan
 * Gruber's free public API (https://github.com/grubersjoe/github-contributions-api).
 *
 * Cached for one day via Next.js `unstable_cache`. The cached function
 * returns a Promise that we hand to a client component, which resolves it
 * with React `use()` — see `components/github-contributions.tsx`.
 */
export const getCachedContributions = unstable_cache(
  async (username: string) => {
    try {
      const apiBase =
        process.env.GITHUB_CONTRIBUTIONS_API_URL ||
        "https://github-contributions-api.jogruber.de"
      const res = await fetch(`${apiBase}/v4/${username}?y=last`)
      if (!res.ok) {
        return []
      }
      const data = (await res.json()) as GitHubContributionsResponse
      return Array.isArray(data?.contributions) ? data.contributions : []
    } catch {
      return []
    }
  },
  ["github-contributions"],
  { revalidate: 86400 } // Cache for 1 day (86400 seconds)
)
