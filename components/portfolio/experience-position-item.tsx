"use client"

import { differenceInMonths, parse } from "date-fns"
import {
  BriefcaseBusinessIcon,
  ChevronsUpDownIcon,
  InfinityIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

/**
 * Position row inside an Experience. Ported from chanhdai's
 * `experience-position-item.tsx` — collapsible header (role + period) with
 * a small icon box on the left, chevron on the right, and a description/
 * skills body that expands inline.
 *
 * The visual vertical line that connects positions lives on the parent
 * (`Experiences` → company block uses `before:absolute before:left-3
 * before:h-full before:w-px before:bg-border`). The L-shape at the bottom
 * of the LAST position (the "bend") is rendered by this component using a
 * `group-last/experience-position`-scoped overlay.
 */
export function ExperiencePositionItem({
  position,
}: {
  position: ExperiencePosition
}) {
  const { start, end } = position.employmentPeriod
  const isOngoing = !end
  const duration = formatDuration(start, end)

  return (
    <Collapsible
      defaultOpen={position.isExpanded}
      disabled={!position.description}
      className="group/experience-position relative"
    >
      {/* L-shape cap that hides the bottom of the parent's vertical line
          and replaces it with a rounded corner. Only visible on the last
          position in the list (`group-last/experience-position:flex`).
          Translate is 9px (chanhdai's exact value via `-translate-y-[9px]`)
          so the corner sits at the right Y offset. Borders use `border-line`
          (solid) NOT `border-border` (alpha) so the overlap with the parent's
          `bg-line` vertical line doesn't compound and darken in dark mode. */}
      <div
        className="pointer-events-none absolute bottom-0 left-3 hidden size-4 bg-background group-last/experience-position:flex"
        aria-hidden
      >
        <span className="size-full -translate-y-[9px] rounded-bl-sm border-b border-l border-line" />
      </div>

      <CollapsibleTrigger
        className={cn(
          "group block w-full text-left",
          "relative before:absolute before:-top-1 before:-right-1 before:-bottom-1.5 before:left-7 before:-z-1 before:rounded-lg before:transition-[background-color] before:ease-out hover:before:bg-accent-muted",
          "outline-none focus-visible:before:inset-ring-2 focus-visible:before:inset-ring-ring/50",
          "data-[disabled]:before:content-none"
        )}
      >
        <div className="relative z-1 mb-1 flex items-start gap-3 text-base">
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md",
              "bg-muted text-muted-foreground",
              "border border-muted-foreground/15 ring-1 ring-line ring-offset-1 ring-offset-background",
              "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
          >
            {position.icon ?? <BriefcaseBusinessIcon />}
          </div>

          <h4 className="flex-1 font-medium text-balance">{position.title}</h4>

          <div className="shrink-0 text-muted-foreground group-data-[disabled]:hidden [&_svg]:size-4">
            <ChevronsUpDownIcon
              aria-hidden
              className="transition-transform duration-150 group-data-[state=open]:rotate-180"
            />
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-9 text-sm text-muted-foreground">
          {position.employmentType && (
            <>
              <div>
                <dt className="sr-only">Employment Type</dt>
                <dd>{position.employmentType}</dd>
              </div>
              <Separator
                className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                orientation="vertical"
                aria-hidden
              />
            </>
          )}

          <div>
            <dt className="sr-only">Employment Period</dt>
            <dd className="flex items-center gap-0.5 tabular-nums">
              <span>{start}</span>
              <span className="font-mono">—</span>
              {isOngoing ? (
                <InfinityIcon
                  className="size-4.5 translate-y-[0.5px]"
                  aria-label="Present"
                  strokeWidth={1.5}
                />
              ) : (
                <span>{end}</span>
              )}
            </dd>
          </div>

          {duration && (
            <>
              <Separator
                className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                orientation="vertical"
                aria-hidden
              />
              <div>
                <dt className="sr-only">Duration</dt>
                <dd className="tabular-nums">{duration}</dd>
              </div>
            </>
          )}
        </dl>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        {position.description && (
          <div className="prose prose-sm max-w-none pt-2 pl-9 dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
            <ReactMarkdown>{position.description}</ReactMarkdown>
          </div>
        )}
      </CollapsibleContent>

      {Array.isArray(position.skills) && position.skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 pt-3 pl-9">
          {position.skills.map((skill) => (
            <li key={skill} className="flex">
              <Tag>{skill}</Tag>
            </li>
          ))}
        </ul>
      )}
    </Collapsible>
  )
}

export type ExperiencePosition = {
  id: string
  title: string
  employmentPeriod: { start: string; end?: string }
  employmentType?: string
  description?: string
  icon?: React.ReactElement
  skills?: string[]
  isExpanded?: boolean
}

function formatDuration(start: string, end?: string): string {
  const startHasMonth = start.includes(".")
  const endHasMonth = end ? end.includes(".") : true

  if (!startHasMonth && end && !endHasMonth) {
    const years = parseInt(end, 10) - parseInt(start, 10)
    if (years <= 0) return ""
    return `${years}y`
  }

  const startDate = parsePeriodDate(start, "first")
  const endDate = end ? parsePeriodDate(end, "last") : new Date()
  const totalMonths = differenceInMonths(endDate, startDate) + 1
  if (totalMonths <= 0) return ""
  if (totalMonths < 12) return `${totalMonths}m`

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) return `${years}y`
  return `${years}y ${months}m`
}

function parsePeriodDate(str: string, fallbackMonth: "first" | "last"): Date {
  if (str.includes(".")) {
    return parse(str, "MM.yyyy", new Date())
  }
  return parse(
    `${fallbackMonth === "last" ? "12" : "01"}.${str}`,
    "MM.yyyy",
    new Date()
  )
}
