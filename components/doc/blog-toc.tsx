"use client"

import type { TOCItemType } from "fumadocs-core/toc"
import { AlignLeft, ChevronDown, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AnchorProvider, useActiveAnchor } from "@/components/doc/toc"

/** Internal tree node built from the flat heading list. */
type TocNode = {
  item: TOCItemType
  children: TocNode[]
  /** ids of this node + all its descendants, used to detect "active group". */
  anchorIds: string[]
}

function anchorId(item: TOCItemType): string {
  return item.url.startsWith("#") ? item.url.slice(1) : item.url
}

function buildTree(items: TOCItemType[]): TocNode[] {
  const roots: TocNode[] = []
  const stack: TocNode[] = []

  for (const item of items) {
    const node: TocNode = { item, children: [], anchorIds: [] }
    while (
      stack.length > 0 &&
      stack[stack.length - 1].item.depth >= item.depth
    ) {
      stack.pop()
    }
    if (stack.length === 0) {
      roots.push(node)
    } else {
      stack[stack.length - 1].children.push(node)
    }
    stack.push(node)
  }

  const collect = (node: TocNode): string[] => {
    const ids = [anchorId(node.item)]
    for (const child of node.children) ids.push(...collect(child))
    node.anchorIds = ids
    return ids
  }
  for (const root of roots) collect(root)

  return roots
}

function TocLink({
  item,
  depth,
  className,
}: {
  item: TOCItemType
  /** 0 = root row (H2). >0 = nested levels. */
  depth: number
  className?: string
}) {
  const activeId = useActiveAnchor()
  const id = anchorId(item)
  const active = activeId === id
  return (
    <a
      href={item.url}
      data-active={active}
      style={{ paddingLeft: depth * 16 }}
      className={cn(
        "block min-w-0 py-1 pr-2 text-sm leading-snug no-underline text-muted-foreground transition-colors",
        "hover:text-foreground hover:no-underline",
        "data-[active=true]:font-medium data-[active=true]:text-foreground",
        className
      )}
    >
      {item.title}
    </a>
  )
}

/** Flatten an entire root subtree into render rows with depth annotations. */
function flattenDescendants(root: TocNode): Array<{ item: TOCItemType; depth: number }> {
  const out: Array<{ item: TOCItemType; depth: number }> = []
  const walk = (nodes: TocNode[], depth: number) => {
    for (const n of nodes) {
      out.push({ item: n.item, depth })
      if (n.children.length > 0) walk(n.children, depth + 1)
    }
  }
  walk(root.children, 1)
  return out
}

function TocRootGroup({ root }: { root: TocNode }) {
  const activeId = useActiveAnchor()
  const isActiveGroup =
    activeId !== undefined && root.anchorIds.includes(activeId)
  const hasChildren = root.children.length > 0

  // `open` follows the active group automatically, but the user can override
  // by clicking the chevron. The override stays in effect until the active
  // section changes again (then we re-sync to the active state).
  const [override, setOverride] = useState<{
    open: boolean
    activeAtClick: string | undefined
  } | null>(null)

  const open =
    override !== null && override.activeAtClick === activeId
      ? override.open
      : isActiveGroup

  const handleOpenChange = (next: boolean) => {
    setOverride({ open: next, activeAtClick: activeId })
  }

  if (!hasChildren) {
    return (
      <li>
        <div className="flex items-center">
          {/* spacer so leaf rows align with their siblings that DO have a chevron */}
          <span aria-hidden className="size-5 shrink-0" />
          <TocLink item={root.item} depth={0} className="flex-1" />
        </div>
      </li>
    )
  }

  const descendants = flattenDescendants(root)

  return (
    <li>
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center">
          <CollapsibleTrigger
            aria-label={open ? "Collapse section" : "Expand section"}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded",
              "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            )}
          >
            {open ? (
              <ChevronDown className="size-3.5" aria-hidden />
            ) : (
              <ChevronRight className="size-3.5" aria-hidden />
            )}
          </CollapsibleTrigger>
          <TocLink item={root.item} depth={0} className="flex-1" />
        </div>
        <CollapsibleContent className="ml-5 mt-1">
          <ul className="flex flex-col border-l border-border">
            {descendants.map(({ item, depth }) => (
              <li key={item.url}>
                <TocLink item={item} depth={depth} />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

/**
 * Sticky right-rail TOC (desktop). Headings are collapsed by default; the
 * group containing the active section auto-expands. The user can override by
 * clicking the chevron next to a heading.
 *
 * The list scrolls internally when it overflows the available height, leaving
 * any sibling content (e.g. an ad slot) free to stay pinned in place.
 */
export function BlogTocSidebar({ items }: { items: TOCItemType[] }) {
  const tree = useMemo(() => buildTree(items), [items])

  if (items.length === 0) return null

  return (
    <AnchorProvider toc={items}>
      <nav
        aria-label="On this page"
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-gutter:stable]">
          <ul className="flex flex-col">
            {tree.map((root) => (
              <TocRootGroup key={root.item.url} root={root} />
            ))}
          </ul>
        </div>
      </nav>
    </AnchorProvider>
  )
}

/**
 * Collapsible TOC pinned to the top of a post on mobile/tablet (`< lg`).
 * Matches chanhdai.com's chip-style "On this page" pattern: subtle inset
 * ring, AlignLeft icon on the left of the trigger, chevron on the right,
 * and a simple flat list with depth-based padding-left. The list flows
 * naturally below the chip (no scroll container — the page scrolls).
 */
export function BlogTocMobile({ items }: { items: TOCItemType[] }) {
  if (items.length === 0) return null

  return (
    <AnchorProvider toc={items}>
      <Collapsible
        className={cn(
          "not-prose group/inline-toc mb-8 rounded-xl bg-muted/30 font-sans inset-ring-1 inset-ring-border/60 lg:hidden"
        )}
      >
        <CollapsibleTrigger
          className={cn(
            "inline-flex w-full items-center gap-2 rounded-xl py-2.5 pr-2 pl-4 text-sm font-medium",
            "text-foreground outline-none transition-colors",
            "group-data-[state=open]/inline-toc:rounded-b-none",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
            "[&_svg]:size-4"
          )}
        >
          <AlignLeft className="-translate-x-0.5" aria-hidden="true" />
          <span>On this page</span>
          <span className="ml-auto shrink-0 text-muted-foreground">
            <ChevronDown
              className="transition-transform group-data-[state=open]/inline-toc:rotate-180"
              aria-hidden="true"
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="flex flex-col px-4 pb-3">
            {items.map((item) => {
              const depth = item.depth
              return (
                <li key={item.url} className="flex py-1">
                  <a
                    href={item.url}
                    data-depth={depth}
                    className={cn(
                      "text-sm text-muted-foreground transition-colors no-underline",
                      "hover:text-foreground",
                      "data-[depth=3]:pl-4 data-[depth=4]:pl-8 data-[depth=5]:pl-12"
                    )}
                  >
                    {item.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </AnchorProvider>
  )
}
