"use client"

import { EllipsisIcon, LinkIcon, ShareIcon } from "lucide-react"
import { toast } from "sonner"

import { copyText } from "@/lib/copy"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LinkedInIcon, XIcon } from "@/components/icons/brand-icons"

/**
 * Share dropdown — exactly chanhdai's pattern. Triggered by a small
 * square icon button next to "Copy page". Dropdown items:
 *
 *   - Copy link  → writes the absolute URL to the clipboard + toast
 *   - Share on X → intent URL
 *   - Share on LinkedIn → share-offsite URL
 *   - Other app  → `navigator.share()` (only when supported)
 */
export function DocShareMenu({ title, url }: { title: string; url: string }) {
  const absoluteUrl = url.startsWith("http")
    ? url
    : typeof window !== "undefined"
      ? new URL(url, window.location.origin).toString()
      : url

  const urlEncoded = encodeURIComponent(absoluteUrl)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="size-7 border-none"
          variant="secondary"
          size="icon-sm"
          aria-label="Share"
        >
          <ShareIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-fit"
        align="start"
        alignOffset={-6}
        collisionPadding={16}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          onClick={() => {
            void copyText(absoluteUrl).then((ok) => {
              if (ok) toast.success("Link copied")
              else toast.error("Failed to copy link")
            })
          }}
        >
          <LinkIcon />
          Copy link
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`https://x.com/intent/tweet?url=${urlEncoded}`}
            target="_blank"
            rel="noopener"
          >
            <XIcon />
            Share on X
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite?url=${urlEncoded}`}
            target="_blank"
            rel="noopener"
          >
            <LinkedInIcon />
            Share on LinkedIn
          </a>
        </DropdownMenuItem>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem
            onClick={(e) => {
              // Keep the menu open until the native share sheet decides.
              e.preventDefault()
              navigator.share({ title, url: absoluteUrl }).catch(() => {})
            }}
          >
            <EllipsisIcon />
            Other app
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
