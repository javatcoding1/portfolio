import { cn } from "@/lib/utils"

/**
 * Doc layout primitives — chanhdai's 3-column grid pattern. The center
 * column is fixed at `--container-3xl` (768px); the side columns expand
 * to fill remaining horizontal space, giving room for floating chrome
 * like the TOC minimap on ultrawide monitors without ever stretching
 * the article itself.
 *
 *   <DocContainer>{ back-link strip, etc. }</DocContainer>
 *   <DocGrid>
 *     <DocLeftCol />
 *     <DocContentCol>{ title + hero + article }</DocContentCol>
 *     <DocRightCol>{ sticky TOC minimap }</DocRightCol>
 *   </DocGrid>
 *
 * Keeping the title inside `<DocContentCol>` (not in the back-link strip)
 * makes the right-rail minimap align vertically with the title.
 *
 * `border-x border-line` on the center container draws the vertical
 * column edges visible on chanhdai's site.
 */
export function DocContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="doc-container"
      className={cn(
        "mx-auto w-full border-x border-line md:max-w-3xl",
        className
      )}
      {...props}
    />
  )
}

export function DocGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="doc-grid"
      className={cn(
        "mx-auto grid w-full grid-cols-1 lg:grid-cols-[1fr_var(--container-3xl)_1fr]",
        className
      )}
      {...props}
    />
  )
}

export function DocLeftCol({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="doc-left-col"
      className={cn("max-lg:hidden", className)}
      {...props}
    />
  )
}

export function DocContentCol(
  props: React.ComponentProps<typeof DocContainer>
) {
  return <DocContainer data-slot="doc-content-col" {...props} />
}

export function DocRightCol({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="doc-right-col"
      className={cn("max-lg:hidden", className)}
      {...props}
    />
  )
}
