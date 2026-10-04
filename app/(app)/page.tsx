import type { Metadata } from "next"

import { cn } from "@/lib/utils"
import { Awards } from "@/components/portfolio/awards"
import { Education } from "@/components/portfolio/education"
import { Experiences } from "@/components/portfolio/experiences"
import { Garden } from "@/components/portfolio/garden"
import { GitHubContributionsPanel } from "@/components/portfolio/github-contributions-panel"
import { Intro } from "@/components/portfolio/intro"
import { Overview } from "@/components/portfolio/overview"
import { ProfileHeader } from "@/components/portfolio/profile-header"
import { Projects } from "@/components/portfolio/projects"
import { SocialLinks } from "@/components/portfolio/social-links"
import { Stack } from "@/components/portfolio/stack"
import { SystemsLab } from "@/components/portfolio/systems-lab"
import { PROFILE } from "@/config/profile"

// Home page uses `title.absolute` so it bypasses the root layout's
// `template: "%s - Vijay Gatla"`. Otherwise the tab reads
// "Vijay Gatla - Vijay Gatla" (template substitutes the display name).
export const metadata: Metadata = {
  title: { absolute: `${PROFILE.displayName} - ${PROFILE.tagline}` },
  description: PROFILE.description,
}

/**
 * Home page — matches chanhdai's `(app)/page.tsx` composition exactly.
 *
 * Section order:
 *   ProfileHeader              — avatar + name + flip tagline
 *   <Separator />              — stripe-divider strip
 *   Overview                   — icon-box mono rows, vertical dashed divider down the middle
 *   SocialLinks                — BARE Panel (top + bottom both render)
 *   GitHubContributionsPanel   — calendar, opts out of top so SocialLinks's bottom is the shared line
 *   <Separator />
 *   Intro                      — greeting + bio (chanhdai's `Hello`)
 *   <Separator />
 *   Garden                     — personal touch (chanhdai has no equivalent)
 *   <Separator />
 *   Stack → Experiences → Education → Projects → Awards (each separated)
 *
 * The chain Overview(bottom-none) → SocialLinks(bare) → GitHub(top-none)
 * produces exactly ONE horizontal line at each boundary inside the intro
 * group — no doubles, no missing edges. Chanhdai's exact pattern.
 *
 * The `**:data-[slot=panel]:scroll-mt-*` rule on the wrapper gives every
 * Panel a scroll-margin equal to header + separator so deep links land
 * cleanly below the sticky header.
 */
export default function HomePage() {
  return (
    <div className="[--separator-height:--spacing(6)] **:data-[slot=panel]:scroll-mt-[calc(var(--header-height)+var(--separator-height))]">
      <div className="mx-auto md:max-w-3xl">
        <ProfileHeader />
        <Separator />

        <Overview />
        <SocialLinks />
        <GitHubContributionsPanel />
        <Separator />

        <Intro />
        <Separator />

        <Garden />
        <Separator />

        <Stack />
        <Separator />

        <Experiences />
        <Separator />

        <SystemsLab />
        <Separator />

        <Education />
        <Separator />

        <Projects />
        <Separator />

        {/* Last panel before the footer — chanhdai's chain: opt out of
            the bottom screen-line so the footer's stripe-divider's top
            screen-line is the single shared seam at this boundary. */}
        <Awards className="screen-line-bottom-none" />
      </div>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "stripe-divider screen-line-bottom h-(--separator-height) w-full border-x border-line",
        className
      )}
      aria-hidden
    />
  )
}
