import { Suspense } from "react"

import { Panel } from "@/components/panel"
import {
  GitHubContributions,
  GitHubContributionsFallback,
} from "@/components/github-contributions"
import { getCachedContributions } from "@/lib/get-cached-contributions"
import { PROFILE } from "@/config/profile"

/**
 * GitHub contributions calendar — NO panel header (chanhdai pattern). The
 * calendar's own footer text ("X contributions in YYYY on GitHub") carries
 * the section identity.
 *
 * `screen-line-top-none` is chanhdai's exact opt-out for the LAST panel
 * in the intro group: `<SocialLinks>` directly above is BARE, so its
 * `screen-line-bottom` paints the shared seam. The panel keeps its
 * `screen-line-bottom` because the next thing is a `<Separator />` (a
 * stripe-divider strip with no horizontal lines of its own).
 */
export function GitHubContributionsPanel() {
  const contributions = getCachedContributions(PROFILE.githubUsername)
  const profileUrl = `https://github.com/${PROFILE.githubUsername}`

  return (
    <Panel id="github">
      <h2 className="sr-only">GitHub Contributions</h2>
      <Suspense fallback={<GitHubContributionsFallback />}>
        <GitHubContributions
          contributions={contributions}
          githubProfileUrl={profileUrl}
        />
      </Suspense>
    </Panel>
  )
}
