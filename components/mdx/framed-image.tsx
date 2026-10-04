import { cn } from "@/lib/utils"

import { ImageZoom } from "./image-zoom"

export type FramedImageProps = React.ComponentProps<"img"> & {
  /** Disable the click-to-zoom modal. Defaults to true. */
  canZoom?: boolean
  /** Optional caption rendered as `<figcaption>` below the image. */
  caption?: React.ReactNode
}

/**
 * In-content image with the nested two-card frame used across the site
 * (same recipe as `CodeBlockShell` and the blog index `PostItem`):
 *
 *   outer  rounded-[9px] border bg-card p-1.5
 *   inner  rounded-[7px] border bg-background overflow-hidden
 *
 * Plus an optional click-to-zoom modal via `react-medium-image-zoom` and
 * an optional `<figcaption>` underneath. The blog post HERO banner uses a
 * simpler single-rounded card on purpose — the nested treatment is
 * reserved for in-content images so they read as "contained artifacts"
 * rather than top-of-page art.
 *
 * Used by:
 * - Plain markdown `![alt](src)` (auto-mapped via the MDX `img` override).
 * - Explicit `<FramedImage src="..." alt="..." caption="..." />` JSX.
 */
export function FramedImage({
  canZoom = true,
  caption,
  className,
  alt = "",
  ...props
}: FramedImageProps) {
  const image = (
    // MDX images have intrinsic dimensions only after load; Next Image
    // requires known dimensions and would distort arbitrary post assets.
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt} className={cn("block w-full", className)} />
  )

  return (
    <figure className="my-[1.5em]">
      <div className="rounded-[9px] border border-border bg-card p-1.5">
        <div className="relative overflow-hidden rounded-[7px] border border-border bg-background">
          {canZoom ? <ImageZoom>{image}</ImageZoom> : image}
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
