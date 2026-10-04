import { listBlogPosts } from "@/app/(app)/blog/utils"
import { PROFILE } from "@/config/profile"
import { SITE_INFO } from "@/config/site"

/**
 * `/rss.xml` — RSS 2.0 feed of every published blog post.
 *
 * Mirrors chanhdai.com's `/blog/rss` route almost verbatim:
 *   - reads posts via `listBlogPosts()` (metadata only — no MDX body
 *     needed for the feed; each `<item>` is just title + link + date +
 *     summary)
 *   - emits one `<item>` per post with title / link / description /
 *     pubDate — no HTML body (readers can click through)
 *   - the feed itself is force-static + `revalidate: false` so it's
 *     generated at build time and served from the CDN with zero
 *     runtime cost (matches chanhdai's setup)
 *
 * Also emits a self-referencing `atom:link` inside the channel, which
 * is what feed validators (Feedly, W3C, etc.) require for a well-formed
 * RSS 2.0 feed with an Atom namespace.
 *
 * Escaping: post titles / descriptions can contain `&`, `<`, `>` from
 * author frontmatter — everything user-generated goes through `escape()`
 * to keep the XML valid.
 */

export const revalidate = false
export const dynamic = "force-static"

const FEED_URL = `${SITE_INFO.url}/rss.xml`
const BLOG_URL = `${SITE_INFO.url}/blog`

function escape(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function GET() {
  const posts = listBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )

  const items = posts
    .map((post) => {
      const url = `${SITE_INFO.url}/blog/${post.slug}`
      const pubDate = new Date(post.metadata.publishedAt).toUTCString()
      const categories = [post.metadata.category, ...(post.metadata.tags ?? [])]
        .filter(Boolean)
        .map((category) => `      <category>${escape(category!)}</category>`)
        .join("\n")
      return `    <item>
      <title>${escape(post.metadata.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(post.metadata.summary || "")}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escape(PROFILE.displayName)}</dc:creator>
${categories}
    </item>`
    })
    .join("\n")

  const lastBuildDate = posts.length
    ? new Date(posts[0]!.metadata.publishedAt).toUTCString()
    : new Date().toUTCString()

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE_INFO.name)} — Blog</title>
    <link>${BLOG_URL}</link>
    <description>${escape(SITE_INFO.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // 1 hour edge cache with a day of stale-while-revalidate — cheap
      // and safe because posts don't change after publish.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
