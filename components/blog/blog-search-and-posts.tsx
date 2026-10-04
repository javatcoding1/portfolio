"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"

import { cn } from "@/lib/utils"
import { PostItem } from "@/components/blog/post-item"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { type listBlogPosts } from "@/app/(app)/blog/utils"

type BlogPost = ReturnType<typeof listBlogPosts>[number]
const PAGE_SIZE = 6

/**
 * Combined search bar + filtered post grid for the `/blog` index. Ported
 * from chanhdai.com's `PostSearchInput` + `PostListWithSearch` pair,
 * collapsed into one client component for simplicity (no URL persistence —
 * if you want shareable links, swap the local `useState` for `nuqs` later).
 *
 * Grid chrome mirrors chanhdai's `PostList`:
 *   - Absolute -z-1 overlay draws the vertical lines between the two
 *     columns of cards on `sm+` (uses `border-r/border-l` on a 2-col grid).
 *   - Each `<li>` gets `screen-line-top`/`screen-line-bottom` so every
 *     row of cards is sandwiched between two full-width horizontal lines.
 *     On `sm+` only odd-indexed items (1st of each row pair) carry the
 *     lines so the right card in the row doesn't double them up.
 *
 * Filtering is a case-insensitive match against the post title and summary.
 * `Esc` clears the query (works from anywhere on the page).
 */
export function BlogSearchAndPosts({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [tag, setTag] = useState("")
  const [page, setPage] = useState(1)

  useHotkeys("esc", () => {
    setQuery("")
    setPage(1)
  }, { enableOnFormTags: true })

  const categories = [...new Set(posts.flatMap((post) => post.metadata.category ?? []))].sort()
  const tags = [...new Set(posts.flatMap((post) => post.metadata.tags ?? []))].sort()
  const trimmed = query.trim().toLowerCase()
  const filtered = posts.filter((post) => {
    const haystack = [
      post.metadata.title,
      post.metadata.summary,
      post.metadata.category,
      ...(post.metadata.tags ?? []),
    ].join(" ").toLowerCase()

    return (
      (!trimmed || haystack.includes(trimmed)) &&
      (!category || post.metadata.category === category) &&
      (!tag || post.metadata.tags?.includes(tag))
    )
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visiblePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      {/* Search bar row — only `screen-line-bottom` here. The top line
          comes from `PageHeadingTitle`'s own `screen-line-bottom` directly
          above; adding `screen-line-top` here would render a doubled 2px
          hairline at the title→search seam. */}
      <div className="screen-line-bottom flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="rounded-lg shadow-none sm:max-w-xs">
          <InputGroupInput
            aria-label="Search blog posts"
            placeholder="Search posts…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon
            className="pr-2.25 data-[disabled=true]:hidden"
            align="inline-end"
            data-disabled={!query.length}
          >
            <InputGroupButton
              className="rounded-sm border-none"
              size="icon-xs"
              title="Clear search"
              aria-label="Clear search"
              onClick={() => {
                setQuery("")
                setPage(1)
              }}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex gap-2">
          <select
            aria-label="Filter by category"
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-36"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select
            aria-label="Filter by tag"
            className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-36"
            value={tag}
            onChange={(event) => {
              setTag(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All tags</option>
            {tags.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative pt-4">
        {/* Vertical separator between the two card columns (chanhdai's
            pattern). `-z-1` sits the lines behind the cards; the cards
            themselves stay above so their borders/shadows are unaffected. */}
        <div className="pointer-events-none absolute inset-0 -z-1 hidden grid-cols-2 gap-4 sm:grid">
          <div className="border-r border-line" />
          <div className="border-l border-line" />
        </div>

        {visiblePosts.length === 0 ? (
          <div className="screen-line-top screen-line-bottom p-4">
            <p className="font-mono text-sm text-muted-foreground">
              No posts match{" "}
              <span className="text-foreground">&ldquo;{query}&rdquo;</span>.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visiblePosts.map((post, index) => (
              <li
                key={post.slug}
                className={cn(
                  "max-sm:screen-line-top max-sm:screen-line-bottom",
                  "sm:nth-[2n+1]:screen-line-top sm:nth-[2n+1]:screen-line-bottom"
                )}
              >
                <PostItem
                  post={post}
                  imageLoading={index < 2 ? "eager" : "lazy"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <nav
          className="screen-line-top mt-4 flex items-center justify-between p-2"
          aria-label="Blog pagination"
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {page} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </>
  )
}
