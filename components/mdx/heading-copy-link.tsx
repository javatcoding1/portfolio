"use client"

import { LinkIcon } from "lucide-react"
import * as React from "react"

import { CopyButton } from "@/components/doc/copy-button"

/**
 * Client-only wrapper for the in-article heading anchor button. Exists
 * ONLY to keep a `window.location` closure on the CLIENT side.
 *
 * `components/mdx/mdx.tsx` runs server-side (MDXRemote/rsc), so we can't
 * pass a `() => window.location.href` thunk down as a prop to a client
 * component — functions can't cross the RSC serialization boundary and
 * doing so throws a runtime 500. This wrapper takes only the serializable
 * `id` string on the server side, and constructs the copy target here on
 * the client at click time (via `<CopyButton text={() => ...} />`, which
 * calls the thunk during its own event handler).
 */
export function HeadingCopyLink({ id }: { id: string }) {
  return (
    <CopyButton
      className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:border-transparent hover:bg-transparent hover:text-foreground group-hover/heading:opacity-100 focus-visible:opacity-100"
      text={() =>
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}#${id}`
          : `#${id}`
      }
      idleIcon={<LinkIcon className="size-3.5" aria-hidden />}
      label="Copy link to section"
      copiedLabel="Link copied to clipboard"
    />
  )
}
