import React from "react"

import { cn } from "@/lib/utils"

/**
 * Chanhdai-style panel: full-bleed top + bottom screen lines, vertical side
 * borders that align with the central 768px content column. Drop sibling
 * `<Panel>`s into a `mx-auto md:max-w-3xl` column and the screen lines will
 * appear to stretch across the whole viewport on ultrawide monitors.
 *
 * Sub-components mirror the chanhdai naming so the home page can read like
 * a flat outline:
 *   <Panel>
 *     <PanelHeader>
 *       <PanelTitle>Section</PanelTitle>
 *       <PanelDescription>Optional subtitle</PanelDescription>
 *     </PanelHeader>
 *     <PanelContent>...</PanelContent>
 *   </Panel>
 */
export function Panel({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "screen-line-bottom border-x border-line",
        className
      )}
      {...props}
    />
  )
}

export function PanelHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="panel-header"
      className={cn(
        "screen-line-bottom px-4 py-3 has-data-[slot=panel-description]:pb-0 has-data-[slot=panel-description]:*:data-[slot=panel-title]:screen-line-bottom",
        className
      )}
      {...props}
    />
  )
}

export function PanelTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="panel-title"
      // Match chanhdai exactly: `font-heading text-3xl` with no vertical
      // padding — the text-3xl line-height (36px) provides the rhythm.
      // The PanelHeader's `has-*` selector adds a `screen-line-bottom`
      // when a PanelDescription is also present.
      className={cn(
        "group/panel-title font-heading text-[1.75rem] font-medium tracking-tight text-balance",
        className
      )}
      {...props}
    />
  )
}

export function PanelTitleSup({
  className,
  ...props
}: React.ComponentProps<"sup">) {
  return (
    <sup
      className={cn(
        "top-[-0.75em] ml-1 text-sm font-medium tracking-normal text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function PanelDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-description"
      // Match chanhdai: 16px (text-base) at py-4 — not py-3 + text-sm.
      className={cn(
        "py-4 text-base text-balance text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function PanelContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-body"
      className={cn("p-4", className)}
      {...props}
    />
  )
}
