"use client"

import { compareDesc, format } from "date-fns"
import {
  ChevronsUpDownIcon,
  CrownIcon,
  PaperclipIcon,
} from "lucide-react"

import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/components/panel"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AWARDS } from "@/config/profile"

export type Award = {
  id: string
  prize: string
  title: string
  /** "YYYY-MM" preferred, "YYYY" accepted. */
  date: string
  /** Context label (e.g., "University", "Personal Project"). */
  grade: string
  icon?: React.ReactElement
  description?: string
  /** Optional URL to certificate / announcement. */
  referenceLink?: string
}

const SORTED_AWARDS = [...AWARDS].sort((a, b) =>
  compareDesc(new Date(a.date), new Date(b.date))
)

/**
 * Awards panel — chanhdai-faithful port of `features/portfolio/components/
 * awards/{index,award-item}.tsx`. Same row layout as Projects:
 *   [icon box] | [DASHED vertical line] | title + prize · date · grade
 *                                          [paperclip] [chevron]
 * Hover highlights the whole row. Expanding the chevron reveals the
 * description inside a `border-t` container.
 */
export function Awards({ className }: { className?: string }) {
  return (
    <Panel id="awards" className={className}>
      <PanelHeader>
        <PanelTitle>
          <a href="#awards">Awards</a>
          <PanelTitleSup>({AWARDS.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <ul>
        {SORTED_AWARDS.map((award) => (
          <li
            key={award.id}
            className="screen-line-bottom last:screen-line-bottom-none"
          >
            <AwardItem award={award} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function AwardItem({ award }: { award: Award }) {
  const canExpand = !!award.description

  return (
    <Collapsible disabled={!canExpand}>
      <div className="group/award flex items-center hover:bg-accent-muted">
        <div
          className={cn(
            "mx-4 flex size-6 shrink-0 items-center justify-center rounded-md border border-muted-foreground/15 bg-muted ring-1 ring-line ring-offset-1 ring-offset-background",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {award.icon ?? <CrownIcon />}
        </div>

        <div className="flex-1 border-l border-dashed border-line">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 p-4 pr-2 text-left">
            <div className="flex-1">
              <h3 className="mb-1 leading-snug font-medium text-balance">
                {award.title}
              </h3>

              <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <div>
                  <dt className="sr-only">Prize</dt>
                  <dd>{award.prize}</dd>
                </div>

                <Separator
                  className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                  orientation="vertical"
                  aria-hidden
                />

                <div>
                  <dt className="sr-only">Awarded in</dt>
                  <dd>
                    <time dateTime={new Date(award.date).toISOString()}>
                      {format(new Date(award.date), "MM.yyyy")}
                    </time>
                  </dd>
                </div>

                <Separator
                  className="data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                  orientation="vertical"
                  aria-hidden
                />

                <div>
                  <dt className="sr-only">Context</dt>
                  <dd>{award.grade}</dd>
                </div>
              </dl>
            </div>

            {award.referenceLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
                    href={award.referenceLink}
                    target="_blank"
                    rel="noopener"
                    aria-label="Open reference attachment"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PaperclipIcon className="pointer-events-none size-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open reference attachment</p>
                </TooltipContent>
              </Tooltip>
            )}

            {canExpand && (
              <div className="shrink-0 text-muted-foreground [&_svg]:size-4">
                <ChevronsUpDownIcon
                  aria-hidden
                  className="transition-transform duration-150 group-data-[state=open]:rotate-180"
                />
              </div>
            )}
          </CollapsibleTrigger>
        </div>
      </div>

      {canExpand && (
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
          <div className="prose prose-sm max-w-none border-t border-line p-4 dark:prose-invert prose-p:my-1">
            <p>{award.description}</p>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
