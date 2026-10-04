import { CalendarCheckIcon } from "lucide-react"

import { BookACallButton } from "@/components/layout/book-a-call-button"
import { CommandMenuTrigger } from "@/components/command-menu"
import { NavMobile } from "@/components/layout/nav-mobile"
import { Separator } from "@/components/ui/separator"
import { MAIN_NAV } from "@/config/site"
import { PROFILE } from "@/config/profile"
import { cn } from "@/lib/utils"

/**
 * Floating bottom navigation pill — mobile only. Ports chanhdai.com's
 * `SiteBottomNav` pattern: a centered pill at the bottom of the viewport
 * containing the command-menu trigger + a hamburger that opens a nav
 * popover. Hidden on `sm:` and above; the regular `SiteHeader` carries
 * those affordances at desktop sizes.
 *
 * Nav items come from `config/site.ts → MAIN_NAV` (same source as the
 * desktop header) so adding or renaming a route updates both nav
 * surfaces with one edit.
 *
 * The pill respects the iOS safe area via `env(safe-area-inset-bottom)`
 * so it doesn't sit under the home indicator.
 */
export function SiteBottomNav() {
  return (
    <div
      className={cn(
        "fixed bottom-[calc(--spacing(2)+env(safe-area-inset-bottom,0))] left-1/2 z-50 flex w-fit -translate-x-1/2 items-center rounded-xl bg-popover py-1 pr-1 pl-2.5 shadow-md ring-1 ring-foreground/10 sm:hidden dark:ring-foreground/20",
        // Override the desktop pill styling on the command-menu trigger so
        // it blends into the bottom-nav surface rather than stacking a
        // second rounded container inside the pill.
        "*:data-[slot=command-menu-trigger]:min-w-20 *:data-[slot=command-menu-trigger]:gap-2 *:data-[slot=command-menu-trigger]:rounded-none *:data-[slot=command-menu-trigger]:border-none *:data-[slot=command-menu-trigger]:bg-transparent *:data-[slot=command-menu-trigger]:px-0 *:data-[slot=command-menu-trigger]:hover:bg-transparent"
      )}
    >
      <CommandMenuTrigger />

      {PROFILE.bookingUrl && (
        <>
          <Separator
            orientation="vertical"
            className="mx-1.5 data-[orientation=vertical]:h-5 data-[orientation=vertical]:self-center"
          />
          {/* Mobile book-a-call icon — opens cal.com modal overlay
              in-page (NO redirect). Same `<BookACallButton>` used in
              the desktop header, just icon-only here. */}
          <BookACallButton
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            ariaLabel="Book a call"
          >
            <CalendarCheckIcon className="size-4" />
          </BookACallButton>
        </>
      )}

      <Separator
        orientation="vertical"
        className="mr-1 ml-2.5 data-[orientation=vertical]:h-6 data-[orientation=vertical]:self-center"
      />

      <NavMobile items={MAIN_NAV} />
    </div>
  )
}
