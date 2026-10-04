"use client"

import { use } from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Activity } from "@/components/contribution-graph"
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/contribution-graph"

/**
 * Year-long GitHub contributions calendar.
 *
 * Consumes the cached `Promise<Activity[]>` produced by
 * `lib/get-cached-contributions.ts` (server) and resolves it client-side
 * with React `use()` so we get server-cached data + a client-rendered
 * tooltip layer without two waterfall fetches.
 */
export function GitHubContributions({
  contributions,
  githubProfileUrl,
  className,
}: {
  contributions: Promise<Activity[]>
  githubProfileUrl: string
  className?: string
}) {
  const data = use(contributions)

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        <a
          className="text-foreground link-underline font-medium"
          href={githubProfileUrl}
          target="_blank"
          rel="noopener"
        >
          View GitHub contributions on GitHub
        </a>
      </div>
    )
  }

  return (
    <ContributionGraph
      className={cn("mx-auto py-2", className)}
      data={data}
      // Sized to fit the 768px panel column comfortably without the
      // calendar overflowing. ~53 weeks × 14px ≈ 742px.
      blockSize={11}
      blockMargin={3}
      blockRadius={2}
    >
      <ContributionGraphCalendar
        className="px-2"
        title="GitHub Contributions"
      >
        {({ activity, dayIndex, weekIndex }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <g>
                <ContributionGraphBlock
                  activity={activity}
                  dayIndex={dayIndex}
                  weekIndex={weekIndex}
                />
              </g>
            </TooltipTrigger>
            <TooltipContent className="font-sans">
              <p>
                {activity.count} contribution{activity.count === 1 ? "" : "s"}{" "}
                on {format(new Date(activity.date), "dd.MM.yyyy")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>

      <ContributionGraphFooter className="px-2">
        <ContributionGraphTotalCount>
          {({ totalCount, year }) => (
            <div className="text-muted-foreground">
              {totalCount.toLocaleString("en")} contributions in {year} on{" "}
              <a
                className="text-foreground link-underline"
                href={githubProfileUrl}
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
              .
            </div>
          )}
        </ContributionGraphTotalCount>

        <ContributionGraphLegend />
      </ContributionGraphFooter>
    </ContributionGraph>
  )
}

export function GitHubContributionsFallback() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <Spinner className="text-muted-foreground" />
    </div>
  )
}
