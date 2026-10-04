import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { CustomMDX } from '@/components/mdx/mdx'
import { BlogTocMobile } from '@/components/doc/blog-toc'
import { BlogComments } from '@/components/blog/blog-comments'
import { DocKeyboardShortcuts } from '@/components/doc/doc-keyboard-shortcuts'
import { LLMCopyButtonWithViewOptions } from '@/components/doc/doc-page-actions'
import { DocShareMenu } from '@/components/doc/doc-share-menu'
import { TocMinimap } from '@/components/doc/toc-minimap'
import {
  DocContainer,
  DocContentCol,
  DocGrid,
  DocLeftCol,
  DocRightCol,
} from '@/components/doc/doc-layout'
import { DocPageRoot } from '@/components/doc/doc-page-root'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDate, getBlogPostBySlug, listBlogPosts } from '@/app/(app)/blog/utils'
import { baseUrl } from '@/app/sitemap'
import { getTableOfContents } from '@/lib/toc'
import { PROFILE } from '@/config/profile'

export async function generateStaticParams() {
  // Slug-only — no need to touch content, so the cheap cached metadata
  // list is enough. Runs once at build time in prod, once per compile
  // in dev.
  const posts = listBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Metadata-only lookup — no MDX body needed for `<head>`. Uses the
  // cached list so it's a memory read, not a file read.
  const post = listBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
    tags,
    category,
  } = post.metadata
  const ogImage = image ? image : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    keywords: tags,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      section: category,
      tags,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Full post (metadata + content) for the currently-rendered slug —
  // ONE file read. Not cached because the body can be tens of KB and
  // we only need it right now, in this render.
  const post = getBlogPostBySlug(slug)
  if (!post) {
    notFound()
  }

  // Prev / next navigation uses the cheap cached metadata list — we
  // only need dates + slugs, never the bodies. Sort newest-first so
  // the arrows in the back-link strip match the reader's expected
  // chronological order.
  const allPosts = listBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )
  const index = allPosts.findIndex((p) => p.slug === slug)

  // Newer post = previous in chronological reading order; older = next.
  const newerPost = index > 0 ? allPosts[index - 1] : undefined
  const olderPost = index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : undefined

  const toc = getTableOfContents(post.content)

  return (
    <>
      {/* 48px header-to-content spacer is provided by `(app)/blog/layout.tsx`
          (chanhdai's shared `(docs)` pattern) — don't duplicate it here. */}

      {/* ←/→ keyboard navigation between adjacent posts. Renders nothing. */}
      <DocKeyboardShortcuts
        previous={newerPost ? `/blog/${newerPost.slug}` : null}
        next={olderPost ? `/blog/${olderPost.slug}` : null}
      />

      <DocPageRoot>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.metadata.title,
              datePublished: post.metadata.publishedAt,
              dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
              description: post.metadata.summary,
              image: post.metadata.image
                ? post.metadata.image.startsWith('http')
                  ? post.metadata.image
                  : `${baseUrl}${post.metadata.image}`
                : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
              articleSection: post.metadata.category,
              keywords: post.metadata.tags,
              url: `${baseUrl}/blog/${post.slug}`,
              author: {
                '@type': 'Person',
                name: PROFILE.displayName,
              },
            }),
          }}
        />

        {/* Top column: back-link strip + title. `data-slot="doc-title"` on
            the `<h1>` is what `DocPageRoot` measures to populate
            `--doc-cols-top` — the right-rail minimap's sticky anchor. */}
        <DocContainer>
          <div className="screen-line-bottom h-px" />

          {/* chanhdai-pattern action strip: ← Blog on the left, then on the
              right: [Copy page ▼] button-group, Share icon, prev/next chips
              with keyboard-shortcut tooltips. */}
          <div className="flex items-center justify-between p-2 pl-4">
            <Button
              className="h-7 gap-2 border-none px-0 tracking-wider text-muted-foreground hover:text-foreground hover:no-underline"
              variant="link"
              size="sm"
              asChild
            >
              <Link href="/blog">
                <ArrowLeftIcon />
                Blog
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <LLMCopyButtonWithViewOptions
                markdownUrl={`/blog.mdx/${post.slug}`}
              />

              <DocShareMenu
                title={post.metadata.title}
                url={`/blog/${post.slug}`}
              />

              {newerPost && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-7 border-none"
                      variant="secondary"
                      size="icon-sm"
                      asChild
                    >
                      <Link
                        href={`/blog/${newerPost.slug}`}
                        aria-label="Previous post"
                      >
                        <ArrowLeftIcon />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="pr-2 pl-3">
                    <div className="flex items-center gap-3">
                      Previous post
                      <Kbd>
                        <ArrowLeftIcon />
                      </Kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}

              {olderPost && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="size-7 border-none"
                      variant="secondary"
                      size="icon-sm"
                      asChild
                    >
                      <Link
                        href={`/blog/${olderPost.slug}`}
                        aria-label="Next post"
                      >
                        <ArrowRightIcon />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="pr-2 pl-3">
                    <div className="flex items-center gap-3">
                      Next post
                      <Kbd>
                        <ArrowRightIcon />
                      </Kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="screen-line-top screen-line-bottom py-px">
            <div className="h-4" />
          </div>

          <h1
            data-slot="doc-title"
            className="screen-line-bottom px-4 text-4xl font-medium tracking-tight text-balance"
          >
            {post.metadata.title}
          </h1>
        </DocContainer>

      {/* 3-column doc grid: empty left rail | 768px article | right rail
          with sticky TOC minimap. The minimap's sticky top is locked to
          `--doc-cols-top` (set by `DocPageRoot` to the title bottom) so it
          appears just below the title's bottom-line and stays there as the
          reader scrolls — chanhdai's exact pattern. */}
      <DocGrid>
        <DocLeftCol />

        <DocContentCol className="screen-line-bottom">
          <article className="prose prose-zinc prose-ncdai dark:prose-invert max-w-none px-4 pt-8 pb-8">
            {post.metadata.summary && (
              <p className="text-muted-foreground">
                {post.metadata.summary}
              </p>
            )}

            <div className="not-prose mt-2 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                Published{' '}
                <time dateTime={new Date(post.metadata.publishedAt).toISOString()}>
                  {formatDate(post.metadata.publishedAt)}
                </time>
              </span>
              {post.metadata.updatedAt &&
                post.metadata.updatedAt !== post.metadata.publishedAt && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      Updated{' '}
                      <time dateTime={new Date(post.metadata.updatedAt).toISOString()}>
                        {formatDate(post.metadata.updatedAt)}
                      </time>
                    </span>
                  </>
                )}
            </div>

            {(post.metadata.category || post.metadata.tags?.length) && (
              <div className="not-prose mb-6 flex flex-wrap gap-1.5" aria-label="Post topics">
                {post.metadata.category && (
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {post.metadata.category}
                  </span>
                )}
                {post.metadata.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <BlogTocMobile items={toc} />

            <CustomMDX source={post.content} />

            <BlogComments />
          </article>
        </DocContentCol>

        <DocRightCol>
          {/* Sticky anchor = title-bottom (--doc-cols-top) + 0.75rem of
              breathing room. `pb-6` on the sticky wrapper makes the
              minimap stop 24px above the article's bottom terminator
              when the sticky bottoms out at scroll-end — otherwise it
              touches the horizontal line below the last paragraph. */}
          <div className="sticky top-[calc(var(--doc-cols-top,0px)+(--spacing(3)))] translate-x-2 pb-6 opacity-0 transition-opacity duration-300 in-data-doc-cols-ready:opacity-100">
            <TocMinimap items={toc} />
          </div>
        </DocRightCol>
      </DocGrid>
      </DocPageRoot>
    </>
  )
}
