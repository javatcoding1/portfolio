"use client"

import type { TOCItemType } from "fumadocs-core/toc"

import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { AnchorProvider, useItems } from "@/components/doc/toc"

/**
 * Compact, hover-expandable table of contents docked to the right of the
 * article column. Ported from chanhdai.com's `TOCMinimap` (registry
 * version, dropped the sound-effect dependency).
 *
 * The collapsed state shows one short horizontal line per heading,
 * indented by depth (H2 = full width, H3 = indented, H4 = more indented).
 * Hovering anywhere on the minimap fades it out and slides in a full
 * clickable TOC list via Radix `HoverCard`.
 *
 * Mount inside a `<DocRightCol>` with a `sticky` wrapper that pins the
 * minimap just below the sticky site header. Because the title lives in
 * the same grid row as `<DocRightCol>`, the minimap aligns vertically
 * with the title at scroll-top — chanhdai's exact pattern.
 */
export function TocMinimap({
  items,
  className,
}: {
  items: TOCItemType[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <AnchorProvider toc={items}>
      <div className={cn("ml-auto w-18", className)}>
        <HoverCard openDelay={50} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div className="flex max-h-[50dvh] flex-col gap-3 overflow-hidden py-3 pl-6 opacity-100 transition-opacity duration-200 data-[state=open]:opacity-0">
              <Minimap />
            </div>
          </HoverCardTrigger>

          <HoverCardContent
            className="w-56 overflow-hidden p-0 duration-200 data-[side=left]:slide-in-from-right-3 data-[side=left]:slide-out-to-right-3"
            align="start"
            alignOffset={0}
            side="left"
            sideOffset={-60}
          >
            <div className="flex max-h-[50dvh] overflow-y-auto overscroll-contain">
              <TocList />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </AnchorProvider>
  )
}

/**
 * The compact "lines" — one row per heading. Depth controls the indent and
 * line length so the shape mirrors the document outline at a glance.
 */
function Minimap() {
  const items = useItems()

  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          data-depth={item.original.depth}
          data-active={item.active}
          className={cn(
            "pointer-events-none h-0.5 w-6 shrink-0 rounded-xs bg-ring/50 transition-[background-color] duration-200 ease-out",
            "data-[depth=3]:ml-2 data-[depth=3]:w-4",
            "data-[depth=4]:ml-4 data-[depth=4]:w-2",
            "data-[depth=5]:ml-6 data-[depth=5]:w-2",
            "data-[active=true]:bg-foreground"
          )}
          aria-hidden
        />
      ))}
    </>
  )
}

/**
 * The full clickable TOC inside the HoverCard. Smooth-scrolls to the
 * target heading and updates the URL hash without a full navigation.
 */
function TocList() {
  const items = useItems()

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const url = e.currentTarget.getAttribute("href") ?? ""
    history.pushState(null, "", url)
    document
      .getElementById(url.replace("#", ""))
      ?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <ul className="flex size-full flex-col list-none p-0 m-0 px-6 py-4 text-sm">
      {items.map((item) => (
        <li key={item.id} className="flex list-none py-1">
          <a
            href={item.original.url}
            data-depth={item.original.depth}
            data-active={item.active}
            className={cn(
              "line-clamp-2 w-full no-underline transition-[color] duration-200",
              "text-muted-foreground hover:text-foreground hover:no-underline data-[active=true]:text-foreground",
              "data-[depth=3]:pl-4 data-[depth=4]:pl-8 data-[depth=5]:pl-12"
            )}
            onClick={handleItemClick}
          >
            {item.original.title}
          </a>
        </li>
      ))}
    </ul>
  )
}
