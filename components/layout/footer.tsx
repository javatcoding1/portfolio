import Link from "next/link";

import { PROFILE } from "@/config/profile";
import { SOURCE_CODE } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Site footer — chanhdai's two-strip pattern preserved verbatim:
 *
 *   1. A short DECORATIVE striped strip (`stripe-divider h-12`) framed
 *      by `screen-line-top` + `screen-line-bottom`. Empty on purpose —
 *      it's the visual "spacer" between page content and the footer
 *      pill.
 *   2. A `screen-line-bottom` strip that hosts a
 *      centered pill (`bg-background` + `border-x border-line`) — same
 *      slot chanhdai uses for his X / GitHub / LinkedIn / DMCA icon
 *      cluster, but we replaced the icons with COPYRIGHT + links
 *      (Credits · RSS · Deploy your own). Copyright text lives here
 *      because the credits definition list moved to `/credits`; the
 *      pill is the last thing before the safe-area spacers.
 *
 * The pill's `before:z-1 after:z-1` on the wrapper lifts the
 * screen-line hairlines above `bg-background` so they draw cleanly on
 * top of the pill's edges instead of being covered by it.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="max-w-screen overflow-x-clip px-2">
      <div className="mx-auto md:max-w-3xl border-x border-line">
        {/* 1. Decorative striped strip. */}
        <div className="screen-line-top screen-line-bottom">
          <div className="stripe-divider h-8" />
        </div>

        {/* 2. Centered pill strip — copyright + links in place of
            chanhdai's icon cluster. `before/after:z-1` keeps the
            screen-lines drawn above the pill's `bg-background`. Pill
            stacks vertically on mobile and turns into a horizontal row
            with vertical Separators on sm+. */}
        <div className="screen-line-bottom flex w-full after:z-1">
          <div className="mx-auto flex flex-col items-center gap-2 border-x border-line bg-background px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:gap-3">
            <p>
              © {year} {PROFILE.displayName}
            </p>

            <Separator className="hidden sm:flex" />

            <Link href="/credits" className="link-underline">
              Credits
            </Link>

            <Separator className="hidden sm:flex" />

            <Link href="/stats" className="link-underline">
              Stats for nerds
            </Link>

            <Separator className="hidden sm:flex" />

            <a
              href="/rss.xml"
              className="link-underline"
              target="_blank"
              rel="noopener"
            >
              RSS
            </a>
          </div>
        </div>
      </div>

      {/* Bottom safe-area + fade-bottom spacers so the fixed mobile
          bottom-nav pill never sits over real content. */}
      <div className="h-(--fade-bottom-height)" />
      <div className="pb-[env(safe-area-inset-bottom,0)]" />
    </footer>
  );
}

/**
 * Thin vertical divider used between pill items on sm+. `h-6` matches
 * the pill's `py-3 + text-sm` line-box height so the divider spans the
 * text baseline cleanly. `w-px` + `bg-line` matches the site's rail
 * treatment.
 */
function Separator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("h-6 w-px bg-line", className)} {...props} />;
}
