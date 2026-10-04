"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NavItem = {
  title: string
  href: string
}

/**
 * Mobile-only hamburger menu that pops up into a vertical list of nav links.
 * Used inside `<SiteBottomNav>` (the floating pill at the bottom of the
 * viewport on small screens). On sm+ this whole component is unmounted via
 * the parent's `sm:hidden`.
 *
 * Ported from chanhdai.com's `NavMobile` — simplified by dropping their
 * `useMediaQuery` server/desktop guard (we just hide the parent on sm+).
 */
export function NavMobile({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
  }, [])

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <NavMobileTrigger />
      </PopoverTrigger>

      <PopoverContent
        className="w-48 rounded-xl p-1"
        side="top"
        align="center"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {items.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/" || pathname === "/index"
                : pathname?.startsWith(link.href) ?? false

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-base",
                  "aria-[current=page]:bg-accent"
                )}
                onClick={() => handleOpenChange(false)}
              >
                {link.title}
              </Link>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * The visual trigger — two stacked horizontal bars that morph into an "X"
 * when the popover opens (via `group-data-[state=open]`).
 */
function NavMobileTrigger(
  props: Omit<React.ComponentProps<typeof Button>, "children">
) {
  return (
    <Button
      className={cn(
        "group relative flex touch-manipulation flex-col gap-1 border-none",
        // Larger invisible hit-target so users with big thumbs can tap
        // accurately on the small icon.
        "before:absolute before:-inset-x-2 before:-top-8 before:-bottom-1",
        "active:scale-none aria-expanded:bg-accent"
      )}
      variant="ghost"
      size="icon"
      aria-label="Toggle Menu"
      {...props}
    >
      <span className="flex h-0.5 w-4 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]:translate-y-[3px] group-data-[state=open]:rotate-45" />
      <span className="flex h-0.5 w-4 transform rounded-[1px] bg-foreground transition-transform group-data-[state=open]:-translate-y-[3px] group-data-[state=open]:-rotate-45" />
    </Button>
  )
}
