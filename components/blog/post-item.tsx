import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

import { type listBlogPosts } from '@/app/(app)/blog/utils'

export type BlogPost = ReturnType<typeof listBlogPosts>[number]
type HeadingTag = 'h2' | 'h3' | 'h4'

/**
 * Single blog card — cover image (if frontmatter `image` is set) + title +
 * date. Client-safe: only types are imported from `app/blog/utils.ts`, so
 * the `fs`-using filesystem reader never leaks into the client bundle when
 * the search-enabled list (`<BlogSearchAndPosts>`) imports this card.
 *
 * Ported from chanhdai.com's `PostItem`: grayscale-by-default cover that
 * fades to color on hover, inset rim, and a "spans the whole card" link so
 * the entire surface is clickable.
 */
export function PostItem({
  post,
  headingAs,
  imageLoading = 'lazy',
}: {
  post: BlogPost
  headingAs?: HeadingTag
  imageLoading?: ImageProps['loading']
}) {
  const Heading = headingAs ?? 'h2'
  // Fall back to the generated OG image so every card has a cover, keeping
  // the grid visually balanced. Authors can override per-post by setting
  // `image:` in the MDX frontmatter.
  const coverSrc =
    post.metadata.image ??
    `/og?title=${encodeURIComponent(post.metadata.title)}`

  return (
    // Outer + inner two-card structure, same recipe as `CodeBlockShell` in
    // `components/code-block.tsx`. Keeps the visual language consistent
    // across code, images, and lists.
    <div className="group/post relative flex h-full flex-col rounded-[9px] border border-border bg-card p-1.5 transition-colors hover:bg-accent-muted">
      <div className="flex h-full flex-col overflow-hidden rounded-[7px] border border-border bg-background">
        <div className="relative select-none">
          <Image
            className="block aspect-1200/630 w-full grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] group-hover/post:grayscale-0"
            src={coverSrc}
            alt={post.metadata.title}
            width={1200}
            height={630}
            loading={imageLoading}
          />
          {/* Hairline under the image to mark the boundary to the title
              area without competing with the outer/inner card borders. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-2 p-3">
          <Heading className="text-lg leading-snug font-medium text-balance">
            <Link href={`/blog/${post.slug}`}>
              {/* Stretched link covers the entire card surface so the image
                  preview is also a click target. */}
              <span className="absolute inset-0" aria-hidden />
              {post.metadata.title}
            </Link>
          </Heading>

          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="text-sm text-muted-foreground">
              <time dateTime={new Date(post.metadata.publishedAt).toISOString()}>
                {format(new Date(post.metadata.publishedAt), 'dd.MM.yyyy')}
              </time>
            </dd>
          </dl>

          {(post.metadata.category || post.metadata.tags?.length) && (
            <div className="flex flex-wrap gap-1.5" aria-label="Post topics">
              {post.metadata.category && (
                <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {post.metadata.category}
                </span>
              )}
              {post.metadata.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
