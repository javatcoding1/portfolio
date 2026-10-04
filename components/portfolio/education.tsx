"use client"

import Image from "next/image"
import ReactMarkdown from "react-markdown"
import {
  ChevronsUpDownIcon,
  GraduationCapIcon,
  InfinityIcon,
} from "lucide-react"

import {
  Panel,
  PanelHeader,
  PanelTitle,
} from "@/components/panel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tag } from "@/components/ui/tag"
import { cn } from "@/lib/utils"
import { EDUCATION } from "@/config/profile"

export type EducationEntry = {
  id: string
  school: string
  logo?: string
  degree?: string
  fieldOfStudy?: string
  period: { start: string; end?: string }
  description?: string
  skills?: string[]
  isExpanded?: boolean
}

/**
 * Education panel — chanhdai-faithful port of `features/portfolio/components/
 * education/index.tsx` + `education-item.tsx`.
 *
 * Each entry is collapsible: GraduationCap icon + school name + chevron in
 * the header; period | degree | field on the line below. Expanding reveals
 * description; skills chips sit at the bottom. Just like Experiences, the
 * vertical hairline connecting entries BENDS at the bottom of the LAST
 * entry — the L-shape "elbow".
 */
export function Education() {
  return (
    <Panel id="education">
      <PanelHeader>
        <PanelTitle>
          <a href="#education">Education</a>
        </PanelTitle>
      </PanelHeader>

      <div className="px-4">
        {EDUCATION.map((item) => (
          <div
            key={item.id}
            id={`education-${item.id}`}
            className="screen-line-bottom scroll-mt-14 py-4 last:screen-line-bottom-none"
          >
            <EducationItem item={item} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function EducationItem({ item }: { item: EducationEntry }) {
  const { start, end } = item.period
  const isOngoing = !end

  return (
    <div className="group/education-item relative before:absolute before:left-3 before:h-full before:w-px before:bg-line">
      {/* L-shape "elbow" at the bottom of the LAST education item. Hides the
          bottom of the vertical line and replaces it with a rounded corner.
          Translate is 9px (chanhdai's exact value via `-translate-y-[9px]`).
          Uses `border-line` (solid) NOT `border-border` (alpha) so the
          overlap with the vertical line above doesn't compound and darken
          in dark mode. */}
      <div
        className="pointer-events-none absolute bottom-0 left-3 hidden size-4 bg-background group-last/education-item:flex"
        aria-hidden
      >
        <span className="size-full -translate-y-[9px] rounded-bl-sm border-b border-l border-line" />
      </div>

      <Collapsible defaultOpen={item.isExpanded} disabled={!item.description}>
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
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt=""
                  width={24}
                  height={24}
                  className="size-full rounded-md object-contain"
                  unoptimized
                />
              ) : (
                <GraduationCapIcon />
              )}
            </div>

            <h3 className="flex-1 font-medium text-balance">{item.school}</h3>

            <div className="shrink-0 text-muted-foreground group-data-[disabled]:hidden [&_svg]:size-4">
              <ChevronsUpDownIcon
                aria-hidden
                className="transition-transform duration-150 group-data-[state=open]:rotate-180"
              />
            </div>
          </div>

          <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-9 text-sm text-muted-foreground">
            <div>
              <dt className="sr-only">Period</dt>
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

            {item.degree && (
              <>
                <Separator
                  className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                  orientation="vertical"
                  aria-hidden
                />
                <div>
                  <dt className="sr-only">Degree</dt>
                  <dd>{item.degree}</dd>
                </div>
              </>
            )}

            {item.fieldOfStudy && (
              <>
                <Separator
                  className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                  orientation="vertical"
                  aria-hidden
                />
                <div>
                  <dt className="sr-only">Field of study</dt>
                  <dd>{item.fieldOfStudy}</dd>
                </div>
              </>
            )}
          </dl>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
          {item.description && (
            <div className="prose prose-sm max-w-none pt-2 pl-9 dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown>{item.description}</ReactMarkdown>
            </div>
          )}
        </CollapsibleContent>

        {Array.isArray(item.skills) && item.skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-3 pl-9">
            {item.skills.map((skill) => (
              <li key={skill} className="flex">
                <Tag>{skill}</Tag>
              </li>
            ))}
          </ul>
        )}
      </Collapsible>
    </div>
  )
}
