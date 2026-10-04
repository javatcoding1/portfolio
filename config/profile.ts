/**
 * Thin hydration wrapper around the JSON data files in `data/`.
 *
 *   data/*.json   ─► pure content, edited by humans / CMS / scripts
 *   config/profile.ts (this file)  ─► glue: React icon components, type
 *                                     casts, and `{placeholder}` interpolation
 *
 * The rest of the codebase keeps importing from `@/config/profile` under
 * the same names (`PROFILE`, `SOCIAL_LINKS`, `TECH_STACK`, `STACK`,
 * `EXPERIENCES`, `EDUCATION`, `PROJECTS`, `AWARDS`) — this file just
 * shuffles where the values come from. To EDIT any portfolio content,
 * touch the JSON files in `data/`, not this file.
 *
 * Format hints (JSON side):
 *   - `employmentPeriod.start` / `period.start` — `"MM.YYYY"` for
 *     month-precise or `"YYYY"` for year-only
 *   - `date` on awards — `"YYYY-MM"`
 *   - `phone: null` in JSON becomes `undefined` at the TS boundary
 *     (JSON has no `undefined` literal).
 *   - `{githubUsername}` / `{email}` placeholders in
 *     `social-links.json` `href` values are interpolated with the
 *     loaded profile values below.
 */

import {
  type LucideIcon,
  MailIcon,
} from "lucide-react"

import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons/brand-icons"
import type { Award } from "@/components/portfolio/awards"
import type { EducationEntry } from "@/components/portfolio/education"
import type { Experience } from "@/components/portfolio/experiences"
import type { Project } from "@/components/portfolio/projects"

import profileData from "@/data/profile.json"
import socialLinksData from "@/data/social-links.json"
import stackData from "@/data/stack.json"
import experiencesData from "@/data/experiences.json"
import educationData from "@/data/education.json"
import projectsData from "@/data/projects.json"
import awardsData from "@/data/awards.json"

/**
 * Single icon type used by `SOCIAL_LINKS` — covers both lucide icons and
 * our brand-icon SVG components (same `(props) => JSX.Element` shape).
 */
type IconComponent =
  | LucideIcon
  | ((props: React.ComponentProps<"svg">) => React.ReactElement)

/**
 * String key → real icon component. Kept as a small module-scope
 * registry so `social-links.json` can reference icons by name without
 * pulling any React imports into the JSON file itself.
 *
 * Add a new icon here → then use its key from `data/social-links.json`.
 */
const ICON_REGISTRY: Record<string, IconComponent> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  mail: MailIcon,
}

// ─────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────

/**
 * Identity + tagline + contact — the top-of-page and metadata surface.
 * Loaded verbatim from `data/profile.json` with a couple of TS-only
 * coercions (`phone: null → undefined`, `bookingUrl` widened to allow
 * `undefined`).
 */
export const PROFILE = {
  ...profileData,
  // JSON has no `undefined`; standardise on `undefined` at the TS
  // boundary so callers can do `PROFILE.phone && ...` naturally.
  phone: (profileData.phone ?? undefined) as string | undefined,
  bookingUrl: (profileData.bookingUrl ?? undefined) as string | undefined,
} as const

// ─────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS (with icon rehydration + href interpolation)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Replace `{githubUsername}` / `{email}` / `{twitterUsername}` /
 * `{linkedinUsername}` placeholders in an href with the loaded profile
 * values. Keeps `data/social-links.json` free of hard-coded personal
 * identifiers so an author only needs to touch `profile.json` when
 * their handle changes.
 */
function interpolateHref(href: string): string {
  return href
    .replaceAll("{githubUsername}", PROFILE.githubUsername)
    .replaceAll("{email}", PROFILE.email)
    .replaceAll("{twitterUsername}", PROFILE.twitterUsername)
    .replaceAll("{linkedinUsername}", PROFILE.linkedinUsername)
}

export const SOCIAL_LINKS: Array<{
  name: string
  href: string
  Icon: IconComponent
}> = socialLinksData.map((link) => {
  const Icon = ICON_REGISTRY[link.iconKey]
  if (!Icon) {
    // Fail loud during development so an unknown `iconKey` in the JSON
    // doesn't silently render a link with no icon. Registered keys
    // right now: github, linkedin, x, mail.
    throw new Error(
      `[config/profile] Unknown iconKey "${link.iconKey}" in data/social-links.json. Register it in ICON_REGISTRY.`
    )
  }
  return {
    name: link.name,
    href: interpolateHref(link.href),
    Icon,
  }
})

// ─────────────────────────────────────────────────────────────────────────
// STACK — flat pills + categorized panel
// ─────────────────────────────────────────────────────────────────────────

/** Tech stack chips. Plain strings — render as monospace pills. */
export const TECH_STACK: string[] = stackData.techStack

/**
 * Categorized stack — drives the chanhdai-style "Stack" panel. Each
 * category is rendered as a numbered row (`01 Language`, `02 Frontend`,
 * …) with brand-icon chips on the right.
 *
 * `iconKey` must match a key in `STACK_ICON_REGISTRY`
 * (`components/portfolio/stack-icons.tsx`). If a tech doesn't have a
 * brand mark there yet, omit `iconKey` in the JSON — the chip renders
 * without an icon.
 */
export const STACK: Array<{
  label: string
  items: Array<{ name: string; iconKey?: string }>
}> = stackData.categories

// ─────────────────────────────────────────────────────────────────────────
// EXPERIENCES / EDUCATION / PROJECTS / AWARDS
// ─────────────────────────────────────────────────────────────────────────

/** Drives the Experiences panel via the existing `WorkExperience` component. */
export const EXPERIENCES: Experience[] = experiencesData as Experience[]

export const EDUCATION: EducationEntry[] = educationData as EducationEntry[]

export const PROJECTS: Project[] = projectsData as Project[]

export const AWARDS: Award[] = awardsData as Award[]
