import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  category?: string
  tags?: string[]
  /** Cover image shown on the blog index card AND as the OG/Twitter unfurl. */
  image?: string
  /**
   * Optional hero banner shown at the top of the individual blog post page.
   * Falls back to `image` if unset; set both independently if you want the
   * card cover and the in-post hero to differ.
   */
  banner?: string
  /**
   * Last-updated date. Either set explicitly in frontmatter (recommended
   * for content-driven updates) or auto-derived from the MDX file's mtime
   * in `getMDXData` below (good default for "just saved a typo fix" flows).
   */
  updatedAt?: string
}

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  const match = frontmatterRegex.exec(fileContent)
  const frontMatterBlock = match![1]
  const content = fileContent.replace(frontmatterRegex, '').trim()
  const frontMatterLines = frontMatterBlock.trim().split('\n')
  const metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['\"](.*)['\"]$/, '$1')
    const metadataKey = key.trim() as keyof Metadata
    if (metadataKey === 'tags') {
      metadata.tags = value.split(',').map((tag) => tag.trim()).filter(Boolean)
    } else {
      ;(metadata as Record<string, string | string[]>)[metadataKey] = value
    }
  })

  return { metadata: metadata as Metadata, content }
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

/**
 * Absolute path to the folder holding every published post. Kept as a
 * module-scope constant so `listBlogPosts` + `getBlogPostBySlug` can't
 * drift out of sync — one string, one meaning.
 */
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

/**
 * Frontmatter-only metadata for a single post. Small (~1 KB) —
 * cacheable, safe to hold in memory, safe to hand to a client component
 * for search / listing.
 */
export type BlogPostMeta = {
  slug: string
  metadata: Metadata
}

/**
 * Same as `BlogPostMeta` plus the full MDX body. NOT cached — the body
 * can be tens of KB, we only ever need one at a time (the currently-
 * rendering post), and reading a single file is a rounding-error cost.
 */
export type BlogPost = BlogPostMeta & {
  content: string
}

/** Read + resolve one post's metadata (frontmatter + `updatedAt` fallback). */
function readMeta(fullPath: string, slug: string): BlogPostMeta {
  const { metadata } = readMDXFile(fullPath)
  if (!metadata.updatedAt) {
    // Default `updatedAt` to the file's mtime (ISO YYYY-MM-DD) so posts
    // that don't set it in frontmatter still get a meaningful
    // "last touched" date. Frontmatter always wins when present.
    metadata.updatedAt = fs.statSync(fullPath).mtime.toISOString().slice(0, 10)
  }
  return { slug, metadata }
}

/**
 * ONLY the metadata list is cached at the module level.
 *
 * Cacheable because:
 *   - the shape is tiny (~1 KB per post × N posts)
 *   - it never changes at runtime in production
 *   - dev-mode HMR re-evaluates this module on save so edits refresh
 *
 * NOT cached: the actual MDX content strings. Those can be tens of KB
 * each, we only ever need one at a time (the currently-rendering post),
 * and reading a single file on demand is cheap. That work happens in
 * `getBlogPostBySlug` below.
 */
let cachedMeta: BlogPostMeta[] | null = null

/**
 * Every published blog post's metadata (title, date, summary, cover…).
 * Cached across `generateStaticParams` / `generateMetadata` / `Page` /
 * `sitemap` / `rss` / `llms.txt` — one filesystem walk per module load,
 * even if the caller invokes it dozens of times.
 *
 * Consumers that only need metadata (blog index, sitemap, prev/next
 * arrows, RSS feed, llms index) should use this. Consumers that need
 * the actual MDX body should use `getBlogPostBySlug` instead — that
 * function reads a single file on demand rather than pulling every
 * post's content into memory.
 */
export function listBlogPosts(): BlogPostMeta[] {
  if (cachedMeta) return cachedMeta
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => path.extname(file) === '.mdx')
  cachedMeta = files.map((file) => {
    const fullPath = path.join(POSTS_DIR, file)
    const slug = path.basename(file, path.extname(file))
    return readMeta(fullPath, slug)
  })
  return cachedMeta
}

/**
 * Full post (metadata + content) for a single slug. NOT cached — one
 * file read per call. Returns `undefined` for unknown or path-escape
 * slugs so the caller can `notFound()` cleanly.
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  // Slug comes from a URL segment; reject anything that could escape
  // the posts directory before touching the filesystem.
  if (!/^[a-z0-9-]+$/i.test(slug)) return undefined
  const fullPath = path.join(POSTS_DIR, `${slug}.mdx`)
  try {
    const { metadata, content } = readMDXFile(fullPath)
    if (!metadata.updatedAt) {
      metadata.updatedAt = fs.statSync(fullPath).mtime.toISOString().slice(0, 10)
    }
    return { slug, metadata, content }
  } catch {
    return undefined
  }
}

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  const targetDate = new Date(date)

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
