"use client"

import { CheckIcon, ChevronDownIcon, CopyIcon, XIcon as XErrorIcon } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { IconSwap, IconSwapItem } from "@/components/icon-swap"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GitHubIcon } from "@/components/icons/brand-icons"
import {
  ClaudeIcon,
  CodexIcon,
  CursorIcon,
  MarkdownIcon,
} from "@/components/icons/ai-icons"

type CopyState = "idle" | "done" | "error"

/** Module-level cache so re-opening the same post doesn't re-fetch the .mdx. */
const markdownCache = new Map<string, string>()

/**
 * "Copy page" button that fetches the post's raw MDX and writes it to the
 * clipboard. Falls back to the page URL if the markdown fetch fails. Ported
 * from chanhdai's `LLMCopyButton` (registry version, simplified — dropped
 * the haptic feedback library and the `ClipboardItem` lazy-init pattern in
 * favour of a plain fetch since our content is small).
 */
function LLMCopyButton({ markdownUrl }: { markdownUrl: string }) {
  const [state, setState] = useState<CopyState>("idle")
  const [isCopying, setIsCopying] = useState(false)
  const operationRef = useRef(false)

  const handleCopy = async () => {
    if (operationRef.current) return
    operationRef.current = true

    const loadingTimer = setTimeout(() => setIsCopying(true), 150)

    try {
      let content = markdownCache.get(markdownUrl)
      if (!content) {
        const res = await fetch(markdownUrl)
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
        content = await res.text()
        markdownCache.set(markdownUrl, content)
      }
      await navigator.clipboard.writeText(content)
      setState("done")
      toast.success("Copied to clipboard")
    } catch {
      // Fallback: copy the page URL so the button never silently fails.
      try {
        await navigator.clipboard.writeText(window.location.href)
        setState("done")
        toast.success("Copied link to clipboard")
      } catch {
        setState("error")
        toast.error("Failed to copy")
      }
    } finally {
      clearTimeout(loadingTimer)
      setIsCopying(false)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      operationRef.current = false
      setState("idle")
    }
  }

  const Icon =
    state === "done" ? CheckIcon : state === "error" ? XErrorIcon : CopyIcon

  return (
    <Button
      className="h-7 gap-1.5 border-none px-2 text-[0.8125rem]"
      variant="secondary"
      size="sm"
      aria-busy={isCopying}
      disabled={isCopying}
      onClick={handleCopy}
    >
      {/* Motion-animated icon swap — popLayout AnimatePresence keyed on
          the copy state, chanhdai's exact pattern from
          `registry/components/copy-button/`. Each state change (idle →
          done → idle) springs the new icon in with an opacity + scale +
          blur curve. */}
      <IconSwap>
        <IconSwapItem key={state} className="inline-flex">
          <Icon className="size-3.5" />
        </IconSwapItem>
      </IconSwap>
      <span className="max-[28rem]:hidden">Copy page</span>
    </Button>
  )
}

function getLLMPrompt(url: string) {
  return `Read ${url}, I want to ask questions about it.`
}

/**
 * Dropdown of "open this post in <LLM app>" links + raw markdown + GitHub
 * source. Mirrors chanhdai's `ViewOptions` but trimmed to the AI apps we
 * actually have brand icons for (OpenAI, Claude, Cursor) plus Markdown +
 * GitHub. The trigger is the chevron at the right end of the copy-page
 * button-group.
 */
function ViewOptions({
  markdownUrl,
  githubSourceUrl,
}: {
  markdownUrl: string
  /** Optional public GitHub URL for the post's MDX file. */
  githubSourceUrl?: string
}) {
  const items = useMemo(() => {
    const fullMarkdownUrl =
      typeof window !== "undefined"
        ? new URL(markdownUrl, window.location.origin).toString()
        : markdownUrl

    const q = getLLMPrompt(fullMarkdownUrl)

    const _items: Array<{ title: string; href: string; icon: typeof MarkdownIcon }> = [
      { title: "View as Markdown", href: fullMarkdownUrl, icon: MarkdownIcon },
    ]

    if (githubSourceUrl) {
      _items.push({ title: "Open in GitHub", href: githubSourceUrl, icon: GitHubIcon })
    }

    _items.push(
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({ hints: "search", q })}`,
        icon: CodexIcon,
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
        icon: ClaudeIcon,
      },
      {
        title: "Open in Cursor",
        href: `https://cursor.com/link/prompt?${new URLSearchParams({ text: q })}`,
        icon: CursorIcon,
      }
    )

    return _items
  }, [markdownUrl, githubSourceUrl])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="size-7 border-none"
          variant="secondary"
          size="icon-sm"
          aria-label="View Options"
        >
          <ChevronDownIcon className="mt-0.5 size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-fit"
        align="start"
        alignOffset={-6}
        collisionPadding={16}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {items.map(({ title, href, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <a href={href} rel="noopener" target="_blank">
              <Icon />
              {title}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Composite chip: `[ Copy page | ▼ ]` button-group. Clicking the left
 * button copies markdown, the right chevron opens the View Options menu.
 */
export function LLMCopyButtonWithViewOptions({
  markdownUrl,
  githubSourceUrl,
  className,
}: {
  markdownUrl: string
  githubSourceUrl?: string
  className?: string
}) {
  return (
    <ButtonGroup className={cn(className)}>
      <LLMCopyButton markdownUrl={markdownUrl} />
      <ButtonGroupSeparator className="border-y-4 border-secondary dark:bg-white/20 data-vertical:my-0" />
      <ViewOptions markdownUrl={markdownUrl} githubSourceUrl={githubSourceUrl} />
    </ButtonGroup>
  )
}
