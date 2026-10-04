import {
  BriefcaseBusinessIcon,
  CodeXmlIcon,
  LightbulbIcon,
  LinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"

import { Panel, PanelContent } from "@/components/panel"
import { PROFILE } from "@/config/profile"

import { CurrentLocalTime } from "./current-local-time"
import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item"

/**
 * Overview panel — chanhdai's "data card" recipe (matches
 * `chanhdai.com/src/features/portfolio/components/overview/index.tsx`):
 *   - 2-col grid (single col on mobile), each row is `IntroItem` (icon + mono text)
 *   - jobs span both columns at the top
 *   - location / time / phone / email / website / pronouns fill the rest
 *   - vertical DASHED divider runs down the middle on sm+ (the
 *     `bg-[linear-gradient(...)] bg-size-[1px_6px] bg-repeat-y` strip)
 *
 * `screen-line-bottom-none` is chanhdai's exact opt-out for this slot —
 * the next panel in the intro group (`SocialLinks`) is BARE so its
 * `screen-line-top` paints the shared line.
 */
export function Overview() {
  return (
    <Panel>
      <h2 className="sr-only">Overview</h2>

      <PanelContent className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {PROFILE.jobs.map((job, index) => (
          <IntroItem key={index} className="sm:col-span-2">
            <IntroItemIcon>{getJobIcon(job.title)}</IntroItemIcon>
            <IntroItemContent>
              {job.title} <span aria-label="at">@</span>
              <IntroItemLink
                className="ml-0.5 font-medium"
                {...(job.experienceId
                  ? {
                      href: `#experience-${job.experienceId}`,
                      target: "_self",
                      rel: "",
                    }
                  : { href: job.website })}
              >
                {job.company}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>
        ))}

        <IntroItem>
          <IntroItemIcon>
            <MapPinIcon />
          </IntroItemIcon>
          <IntroItemContent>
            <IntroItemLink
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PROFILE.location)}`}
              aria-label={`Location: ${PROFILE.location}`}
            >
              {PROFILE.location}
            </IntroItemLink>
          </IntroItemContent>
        </IntroItem>

        <CurrentLocalTime timeZone={PROFILE.timeZone} />

        {PROFILE.phone && (
          <IntroItem>
            <IntroItemIcon>
              <PhoneIcon />
            </IntroItemIcon>
            <IntroItemContent>
              <IntroItemLink
                href={`tel:${PROFILE.phone.replace(/\s+/g, "")}`}
                target="_self"
                rel=""
              >
                {PROFILE.phone}
              </IntroItemLink>
            </IntroItemContent>
          </IntroItem>
        )}

        <IntroItem>
          <IntroItemIcon>
            <MailIcon />
          </IntroItemIcon>
          <IntroItemContent>
            <IntroItemLink
              href={`mailto:${PROFILE.email}`}
              target="_self"
              rel=""
            >
              {PROFILE.email}
            </IntroItemLink>
          </IntroItemContent>
        </IntroItem>

        <IntroItem>
          <IntroItemIcon>
            <LinkIcon />
          </IntroItemIcon>
          <IntroItemContent>
            <IntroItemLink
              href={PROFILE.website}
              aria-label={`Personal website: ${PROFILE.website}`}
            >
              {PROFILE.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </IntroItemLink>
          </IntroItemContent>
        </IntroItem>

        <IntroItem>
          <IntroItemIcon>
            <UserIcon />
          </IntroItemIcon>
          <IntroItemContent aria-label={`Pronouns: ${PROFILE.pronouns}`}>
            {PROFILE.pronouns}
          </IntroItemContent>
        </IntroItem>
      </PanelContent>

      {/* Vertical dashed divider down the middle of the 2-col grid —
          chanhdai's exact recipe (overview/index.tsx). The `-translate-x-2.25`
          shifts the 1px line so it visually aligns with the gap between
          the two grid columns rather than the geometric center of the
          panel (which includes the `border-x` rails). Hidden on mobile
          when the grid collapses to a single column. */}
      <div
        className="pointer-events-none absolute top-px bottom-0 left-1/2 -z-1 w-px -translate-x-2.25 bg-[linear-gradient(to_bottom,var(--line)_4px,transparent_2px)] bg-size-[1px_6px] bg-repeat-y max-sm:hidden"
        aria-hidden
      />
    </Panel>
  )
}

function getJobIcon(title: string) {
  if (/(developer|engineer)/i.test(title)) return <CodeXmlIcon />
  if (/(founder|co-founder)/i.test(title)) return <LightbulbIcon />
  return <BriefcaseBusinessIcon />
}
