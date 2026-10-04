import { CalendarCheckIcon } from "lucide-react";

import { BookACallButton } from "@/components/layout/book-a-call-button";
import { CommandMenuTrigger } from "@/components/command-menu";
import { NavDesktop } from "@/components/layout/nav-desktop";
import { SiteMark } from "@/components/layout/site-mark";
import { ThemeToggle } from "@/components/layout/theme-toggler";
import { Separator } from "@/components/ui/separator";
import { MAIN_NAV } from "@/config/site";
import { PROFILE } from "@/config/profile";

/**
 * Sticky site header — chanhdai-pattern: full-bleed `<header>` with a
 * 768px central column that has `screen-line-top`/`bottom` so the lines
 * bleed across the viewport on ultrawide monitors. Inside the column:
 * left = wordmark / logo, right = inline nav + command-menu trigger +
 * GitHub link + theme toggle (each separated by vertical separators).
 *
 * `--header-height` is exposed for scroll-margin calculations on anchor
 * targets (Panel sections use `scroll-mt-[calc(var(--header-height)+...)]`).
 *
 * Nav items come from `config/site.ts → MAIN_NAV` so this header and the
 * mobile `<SiteBottomNav>` always show the same routes — no duplication.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 max-w-screen overflow-x-clip bg-background px-2">
      <div className="screen-line-top screen-line-bottom mx-auto flex h-(--header-height) items-center justify-between gap-2 border-x border-line px-2 sm:gap-4 md:max-w-3xl">
        <SiteMark />

        <div className="flex-1" />

        <NavDesktop items={MAIN_NAV} className="max-sm:hidden" />

        <Separator
          orientation="vertical"
          className="max-sm:hidden data-[orientation=vertical]:h-5 data-[orientation=vertical]:self-center"
        />

        {/* Search trigger — hidden on mobile; lives in the floating
            `SiteBottomNav` pill at the bottom of the viewport instead. */}
        <div className="max-sm:hidden">
          <CommandMenuTrigger />
        </div>

        {PROFILE.bookingUrl && (
          <>
            <Separator
              orientation="vertical"
              className="max-sm:hidden data-[orientation=vertical]:h-5 data-[orientation=vertical]:self-center"
            />

            {/* Book-a-call opens cal.com as an in-page MODAL OVERLAY
                (no redirect) via `@calcom/embed-react`. The button is
                desktop-only here; mobile users get the icon version
                inside `<SiteBottomNav>`. */}
            <BookACallButton
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90 max-sm:hidden"
              ariaLabel="Book a call"
            >
              <CalendarCheckIcon className="size-3.5" />
              <span>Book a call</span>
            </BookACallButton>
          </>
        )}

        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-5 data-[orientation=vertical]:self-center"
        />

        <ThemeToggle />
      </div>
    </header>
  );
}
