import fs from 'fs/promises'
import path from 'path'

import { notFound } from 'next/navigation'

/**
 * Raw-markdown route handler for `/blog/<slug>.mdx`. The user-facing URL
 * is rewritten in `next.config.ts` (`/blog/:slug.mdx` → `/blog.mdx/:slug`)
 * so this folder name uses the literal `.mdx` segment — chanhdai's exact
 * pattern for serving the unrendered MDX source to the "Copy page" /
 * "View as Markdown" buttons in the post header.
 *
 * Source files live at `<repoRoot>/content/posts/` (same location
 * `getBlogPosts()` in `app/(app)/blog/utils.ts` reads from) — the
 * intent is CMS-friendly: content sits outside the `app/` tree so a
 * headless CMS can own that folder later without touching routes.
 *
 * `dynamic = 'force-static'` + `generateStaticParams` makes this a
 * build-time-frozen response per known post; new posts require a rebuild.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export async function generateStaticParams() {
  const files = await fs.readdir(POSTS_DIR)
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.mdx$/, '') }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Slug comes from a URL segment; reject anything that could escape the
  // posts directory before touching the filesystem.
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    notFound()
  }

  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return new Response(content, {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    notFound()
  }
}
