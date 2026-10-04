import GithubSlugger from "github-slugger"
import type { TOCItemType } from "fumadocs-core/toc"

/**
 * Extract a table-of-contents tree from raw MDX source.
 *
 * Uses a deterministic regex scan rather than running the MDX pipeline twice.
 * The slugs produced here use `github-slugger`, which is the same library
 * `rehype-slug` uses on the render side — so heading anchors and TOC links
 * stay in sync.
 *
 * Caveats:
 *   - Headings inside fenced code blocks are skipped.
 *   - Headings written as JSX (`<h2>…</h2>`) are not picked up.
 *     Use markdown headings (`## …`) for them to appear in the TOC.
 */
export function getTableOfContents(source: string): TOCItemType[] {
  const slugger = new GithubSlugger()
  const items: TOCItemType[] = []
  const lines = source.split(/\r?\n/)

  let inFence = false
  let fenceMarker = ""

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    // Track fenced code blocks (``` or ~~~) so we skip headings inside them.
    const fence = line.match(/^(\s*)(```+|~~~+)/)
    if (fence) {
      if (!inFence) {
        inFence = true
        fenceMarker = fence[2]
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false
        fenceMarker = ""
      }
      continue
    }
    if (inFence) continue

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (!match) continue

    const depth = match[1].length
    // Strip inline markdown formatting from the heading text so it reads cleanly.
    const text = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()

    if (!text) continue

    items.push({
      title: text,
      url: `#${slugger.slug(text)}`,
      depth,
    })
  }

  return items
}
