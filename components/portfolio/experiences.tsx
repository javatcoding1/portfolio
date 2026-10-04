import Image from "next/image"

import {
  Panel,
  PanelHeader,
  PanelTitle,
} from "@/components/panel"
import { EXPERIENCES } from "@/config/profile"
import { cn } from "@/lib/utils"

import {
  ExperiencePositionItem,
  type ExperiencePosition,
} from "./experience-position-item"

export type Experience = {
  id: string
  companyName: string
  companyLogo?: string
  companyIcon?: React.ReactElement
  companyWebsite?: string
  location?: string
  locationType?: "On-site" | "Hybrid" | "Remote"
  positions: ExperiencePosition[]
  isCurrentEmployer?: boolean
}

/**
 * Experiences panel — chanhdai-faithful port of `features/portfolio/components/
 * experiences/index.tsx` + `experience-item.tsx`.
 *
 * Each company is a row:
 *   [logo] CompanyName ········· Location (LocationType) [live-dot]
 * Below the row, positions stack vertically connected by a single hairline
 * that BENDS at the bottom of the last position (the L-shape "elbow" the
 * user called out). Position rows are collapsible — clicking the chevron
 * expands the description.
 */
export function Experiences() {
  return (
    <Panel id="experience">
      <PanelHeader>
        <PanelTitle>
          <a href="#experience">Experience</a>
        </PanelTitle>
      </PanelHeader>

      <div className="px-4">
        {EXPERIENCES.map((experience) => (
          <ExperienceItem key={experience.id} experience={experience} />
        ))}
      </div>
    </Panel>
  )
}

function ExperienceItem({ experience }: { experience: Experience }) {
  return (
    <div
      id={`experience-${experience.id}`}
      className="group/experience screen-line-bottom scroll-mt-14 space-y-4 py-4 last:screen-line-bottom-none"
    >
      <div className="flex items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center select-none",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
            "[&_svg:not([class*='size-'])]:size-5"
          )}
        >
          {experience.companyLogo ? (
            <Image
              src={experience.companyLogo}
              alt={`${experience.companyName} logo`}
              width={24}
              height={24}
              quality={100}
              className="size-full rounded-sm object-contain grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] group-hover/experience:grayscale-0"
              unoptimized
              aria-hidden
            />
          ) : (
            experience.companyIcon ?? (
              <span className="flex size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            )
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-x-3 gap-y-1 pr-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-xl/6 font-medium">
            {experience.companyWebsite ? (
              <a
                className="link"
                href={experience.companyWebsite}
                target="_blank"
                rel="noopener"
              >
                {experience.companyName}
              </a>
            ) : (
              experience.companyName
            )}
          </h3>

          {experience.location && (
            <dl className="flex min-w-0 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
              <dt className="sr-only">Location</dt>
              <dd className="truncate">{experience.location}</dd>

              {experience.locationType && (
                <>
                  <dt className="sr-only">Location type</dt>
                  <dd>({experience.locationType})</dd>
                </>
              )}

              {experience.isCurrentEmployer && (
                <>
                  <dt className="sr-only">Employment status</dt>
                  <dd>
                    <span className="sr-only">Current</span>
                    <span
                      className="relative flex size-2.5 translate-x-px translate-y-px items-center justify-center"
                      aria-hidden
                    >
                      <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-info opacity-50 motion-reduce:animate-none" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-info" />
                    </span>
                  </dd>
                </>
              )}
            </dl>
          )}
        </div>
      </div>

      {/* Vertical hairline (`before:` pseudo) runs the full height of the
          position list. Each position has `group/experience-position` so the
          LAST one can paint its L-shape "bend" over the bottom of this line
          (see `experience-position-item.tsx`).
          Uses `bg-line` (solid in both themes) NOT `bg-border` — the L's
          `border-l` overlaps this 1px line in the same column, and any
          alpha would compound at the overlap making that column visibly
          darker (was an ugly artifact in dark mode). */}
      <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-line">
        {experience.positions.map((position) => (
          <ExperiencePositionItem key={position.id} position={position} />
        ))}
      </div>
    </div>
  )
}
