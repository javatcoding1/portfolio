"use client"

import Image from "next/image"
import ReactMarkdown from "react-markdown"
import {
  BoxIcon,
  ChevronsUpDownIcon,
  InfinityIcon,
  LinkIcon,
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
import { Tag } from "@/components/ui/tag"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PROJECTS } from "@/config/profile"

export type Project = {
  id: string
  title: string
  period: { start: string; end?: string }
  link: string
  skills: string[]
  description?: string
  logo?: string
  isExpanded?: boolean
}

/**
 * Projects panel — chanhdai-faithful port of `features/portfolio/components/
 * projects/index.tsx` + `project-item.tsx`.
 *
 * Each project is a row:
 *   [logo] | title       [link-icon] [chevron]
 *          | period
 * with a vertical DASHED border separating the logo from the content. The
 * row hover-highlights as a unit. Expanding the chevron reveals the
 * description and skills chips inside a `border-t` container.
 */
export function Projects() {
  return (
    <Panel id="projects">
      <PanelHeader>
        <PanelTitle>
          <a href="#projects">Projects</a>
          <PanelTitleSup>({PROJECTS.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <ul>
        {PROJECTS.map((project) => (
          <li key={project.id} className="screen-line-bottom last:screen-line-bottom-none">
            <ProjectItem project={project} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function ProjectItem({ project }: { project: Project }) {
  const { start, end } = project.period
  const isOngoing = !end
  const isSinglePeriod = end === start

  return (
    <Collapsible defaultOpen={project.isExpanded}>
      <div className="group/project flex items-center hover:bg-accent-muted">
        {project.logo ? (
          <Image
            src={project.logo}
            alt={project.title}
            width={32}
            height={32}
            quality={100}
            className="mx-4 flex size-6 shrink-0 grayscale select-none group-hover/project:grayscale-0"
            unoptimized
            aria-hidden
          />
        ) : (
          <div className="mx-4 flex size-6 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted text-muted-foreground ring-1 ring-line ring-offset-1 ring-offset-background select-none">
            <BoxIcon className="size-4" />
          </div>
        )}

        <div className="flex-1 border-l border-dashed border-line">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 p-4 pr-2 text-left">
            <div className="flex-1">
              <h3 className="mb-1 leading-snug font-medium text-balance">
                {project.title}
              </h3>

              <dl className="text-sm text-muted-foreground">
                <dt className="sr-only">Period</dt>
                <dd className="flex items-center gap-0.5 tabular-nums">
                  <span>{start}</span>
                  {!isSinglePeriod && (
                    <>
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
                    </>
                  )}
                </dd>
              </dl>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                {/* Open-project link sits inside the trigger row but stops
                    propagation so clicking the icon doesn't toggle the
                    collapsible — it opens the project in a new tab. */}
                <a
                  className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
                  href={project.link}
                  target="_blank"
                  rel="noopener"
                  aria-label="Open project"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon className="pointer-events-none size-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open project</p>
              </TooltipContent>
            </Tooltip>

            <div className="shrink-0 text-muted-foreground [&_svg]:size-4">
              <ChevronsUpDownIcon
                aria-hidden
                className="transition-transform duration-150 group-data-[state=open]:rotate-180"
              />
            </div>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none">
        <div className="space-y-4 border-t border-line p-4">
          {project.description && (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          )}

          {project.skills.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <li key={skill} className="flex">
                  <Tag>{skill}</Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
