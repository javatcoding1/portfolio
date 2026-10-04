import { visit } from "unist-util-visit"

type CodeNode = {
  type: "code"
  lang?: string | null
  value: string
}

type MdxJsxFlowElement = {
  type: "mdxJsxFlowElement"
  name: string
  attributes: Array<{
    type: "mdxJsxAttribute"
    name: string
    value: string
  }>
  children: never[]
}

type Parent = {
  children: Array<CodeNode | MdxJsxFlowElement | unknown>
}

/**
 * Remark plugin that rewrites ` ```mermaid ` fenced code blocks into a
 * `<Mermaid chart="…" />` MDX JSX element.
 *
 * Runs before `rehype-pretty-code`, so mermaid sources are routed to the
 * client `<Mermaid>` component instead of being syntax-highlighted as text.
 */
export function remarkMermaid() {
  return (tree: unknown) => {
    visit(
      // unist-util-visit accepts any unist Node — we narrow inside the visitor.
      tree as Parameters<typeof visit>[0],
      "code",
      (node, index, parent) => {
        const codeNode = node as unknown as CodeNode
        if (!parent || index === undefined || index === null) return
        if (codeNode.lang !== "mermaid") return

        const replacement: MdxJsxFlowElement = {
          type: "mdxJsxFlowElement",
          name: "Mermaid",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "chart",
              value: codeNode.value,
            },
          ],
          children: [],
        }

        ;(parent as unknown as Parent).children[index] = replacement
      }
    )
  }
}

type HastTextNode = { type: "text"; value: string }
type HastElementNode = {
  type: "element"
  tagName: string
  properties?: Record<string, unknown>
  children?: Array<HastElementNode | HastTextNode>
}

/**
 * Rehype plugin that stashes the original source of each fenced code block
 * onto its `<pre>` as `data-raw`, BEFORE `rehype-pretty-code` tokenises the
 * inner `<code>` into Shiki spans. The client `<CodeBlock>` reads this back
 * to power the copy-to-clipboard button.
 */
export function rehypeCodeRawString() {
  return (tree: unknown) => {
    visit(
      tree as Parameters<typeof visit>[0],
      "element",
      (node) => {
        const el = node as unknown as HastElementNode
        if (el.tagName !== "pre") return
        const first = el.children?.[0] as HastElementNode | undefined
        if (!first || first.tagName !== "code") return

        const raw = (first.children ?? [])
          .filter((c): c is HastTextNode => (c as HastTextNode).type === "text")
          .map((c) => c.value)
          .join("")

        if (!raw) return
        el.properties = el.properties ?? {}
        ;(el.properties as Record<string, unknown>)["data-raw"] = raw
      }
    )
  }
}

/**
 * After `rehype-pretty-code` runs, it wraps `<pre>` in a `<figure>` and
 * lifts `data-raw` (and only `data-raw` — `data-language` stays on the pre)
 * up to that figure. The MDX `pre` component mapping only sees props from
 * the `<pre>` element, so we mirror `data-raw` back down so the copy button
 * has the source it needs.
 */
export function rehypeMirrorCodeRawToPre() {
  return (tree: unknown) => {
    visit(
      tree as Parameters<typeof visit>[0],
      "element",
      (node) => {
        const el = node as unknown as HastElementNode
        if (el.tagName !== "figure") return

        const raw = el.properties?.["data-raw"]
        if (typeof raw !== "string") return

        for (const child of el.children ?? []) {
          const childEl = child as HastElementNode
          if (childEl.tagName !== "pre") continue
          childEl.properties = childEl.properties ?? {}
          ;(childEl.properties as Record<string, unknown>)["data-raw"] = raw
          break
        }
      }
    )
  }
}
