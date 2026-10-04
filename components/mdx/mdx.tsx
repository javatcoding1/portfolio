import type { MDXRemoteProps } from "next-mdx-remote/rsc"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import Image from "next/image"
import React from "react"
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import rehypeUnwrapImages from "rehype-unwrap-images"
import remarkGfm from "remark-gfm"

import {
  rehypeCodeRawString,
  rehypeMirrorCodeRawToPre,
  remarkMermaid,
} from "@/lib/mdx-plugins"
import { cn } from "@/lib/utils"
import {
  CodeBlock,
  PackageCreate,
  PackageExec,
  PackageInstall,
  PackageRun,
} from "@/components/mdx/code-block"
import { FramedImage } from "@/components/mdx/framed-image"
import { HeadingCopyLink } from "@/components/mdx/heading-copy-link"
import { Mermaid } from "@/components/mdx/mermaid"

function Table({
  data,
}: {
  data: { headers: string[]; rows: string[][] }
}) {
  return (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href

  if (!href) {
    return <a {...props} />
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

/**
 * Backwards-compat shim for posts that still use explicit `<Image>` JSX
 * (the `next/image` component) — keeps lazy-loading + optimization for
 * those, while plain markdown `![alt](src)` flows through `FramedImage`.
 */
function RoundedImage(props: React.ComponentProps<typeof Image>) {
  const { alt = "", ...rest } = props
  return <Image alt={alt} className="rounded-lg" {...rest} />
}

/**
 * Inline `<code>` for `` `foo` `` AND the inner `<code>` of fenced blocks.
 *
 * `rehype-pretty-code` is configured with `bypassInlineCode: true`, so inline
 * code reaches us with no `data-language`. Fenced blocks come through with
 * `data-language` set — we leave those untouched and let the CSS in
 * `globals.css` (scoped to `figure[data-rehype-pretty-code-figure]`) style
 * the token spans.
 */
function CodeElement({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
  const isFenced = "data-language" in props
  if (isFenced) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  return (
    <code
      className={cn(
        "rounded bg-muted/80 px-[0.35em] py-[0.15em] font-mono text-[0.875em] font-medium text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const tagName = `h${level}` as const

  const Heading = ({
    id,
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    // No id (rare — rehype-slug generates one for every heading with
    // text), no anchor. Fall back to a plain heading.
    if (!id) {
      return React.createElement(tagName, { className, ...props }, children)
    }

    // chanhdai's exact heading pattern (see chanhdai.com/src/components/heading.tsx):
    // the heading is a flex row containing (a) the heading text wrapped
    // in an `<a href="#id">` so clicking the title jumps to the section,
    // and (b) a `<CopyButton>` with a `LinkIcon` that copies the full
    // page URL + hash to the clipboard on click. Previously we used an
    // overhanging `#` positioned with `absolute -left-*`, which kept
    // getting tangled with the article's `border-x border-line` rail on
    // hover. Rendering the button INSIDE the heading's flow means it
    // can never cross the border.
    return React.createElement(
      tagName,
      {
        id,
        className: cn(
          "group/heading flex scroll-mt-20 flex-row items-center gap-1",
          className
        ),
        ...props,
      },
      <a key="text" href={`#${id}`} className="peer not-prose">
        {children}
      </a>,
      <HeadingCopyLink key="link" id={id} />
    )
  }
  Heading.displayName = `Heading${level}`
  return Heading
}

const components: MDXRemoteProps["components"] = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: CustomLink,
  code: CodeElement,
  pre: CodeBlock,
  // `rehype-pretty-code` wraps every `<pre>` in a `<figure>`. With our
  // `<CodeBlock>` providing all the chrome, that wrapper is now redundant
  // and only contributes browser/prose default margins. Collapse it to a
  // fragment for code-block figures; leave any other (rare) figures alone.
  figure: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
    if ("data-rehype-pretty-code-figure" in props) {
      return <>{children}</>
    }
    return <figure {...props}>{children}</figure>
  },
  // Markdown `![alt](src)` → framed + click-to-zoom (chanhdai.com pattern).
  // `rehype-unwrap-images` strips the wrapping `<p>` so the resulting
  // `<figure>` is valid HTML and React doesn't hydrate-mismatch.
  img: ({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <FramedImage src={src} alt={alt ?? ""} {...rest} />
  ),
  // Explicit MDX JSX — same component, exposed under both names so authors
  // can write either `<FramedImage>` (chanhdai-style) or stick with `<Image>`.
  FramedImage,
  Image: RoundedImage,
  Table,
  Mermaid,
  PackageInstall,
  PackageRun,
  PackageExec,
  PackageCreate,
}

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  bypassInlineCode: true,
  defaultLang: { block: "plaintext", inline: "plaintext" },
}

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMermaid],
    rehypePlugins: [
      // Unwrap any single-image `<p>` so the `<figure>` we render for `img`
      // ends up as a block-level sibling of surrounding paragraphs (valid
      // HTML, no hydration mismatch).
      rehypeUnwrapImages,
      rehypeSlug,
      // Must run BEFORE rehype-pretty-code so it sees the original
      // `<pre><code>raw text</code></pre>` structure and can stash the
      // unhighlighted source as `data-raw` for the copy button.
      rehypeCodeRawString,
      [rehypePrettyCode, prettyCodeOptions],
      // rehype-pretty-code lifts `data-raw` from the `<pre>` up to the
      // wrapping `<figure>`. Mirror it back down so our `pre` MDX mapping
      // can read it.
      rehypeMirrorCodeRawToPre,
    ],
  },
}

export function CustomMDX(props: {
  source: string
  components?: MDXRemoteProps["components"]
}) {
  return (
    <MDXRemote
      source={props.source}
      components={{ ...components, ...(props.components ?? {}) }}
      options={options}
    />
  )
}
