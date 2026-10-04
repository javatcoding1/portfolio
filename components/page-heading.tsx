import { cn } from "@/lib/utils"

/**
 * Page heading primitives — chanhdai's `(pages)/blog` pattern. Used at the
 * top of index pages (e.g. `/blog`) to draw a small uppercase tagline above
 * a large balanced title, with `screen-line-top`/`screen-line-bottom`
 * dividers framing the title row so the column edges line up cleanly with
 * the bordered `<DocContainer>` above and below.
 *
 *   <PageHeading>
 *     <PageHeadingTagline>Blog</PageHeadingTagline>
 *     <PageHeadingTitle>Writing about code, design…</PageHeadingTitle>
 *   </PageHeading>
 */
export function PageHeading({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-heading"
      className={cn("group/page-heading", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PageHeadingTagline({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-heading-tagline"
      className={cn(
        "px-4 pb-2 text-sm/none font-medium tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function PageHeadingTitle({
  className,
  ...props
}: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-heading-title"
      className={cn(
        "screen-line-top screen-line-bottom px-4 py-4 text-4xl font-medium tracking-tight text-balance",
        className
      )}
      {...props}
    />
  )
}
