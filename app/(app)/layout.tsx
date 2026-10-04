import Footer from "@/components/layout/footer"
import { SiteBottomNav } from "@/components/layout/site-bottom-nav"
import { SiteHeader } from "@/components/layout/site-header"

/**
 * App shell — chanhdai-pattern. Wraps EVERY user-facing page in the route
 * group with the sticky site header, the full-bleed `<main>` (whose
 * `overflow-x-clip` is what lets the `screen-line-*` utilities bleed
 * across the viewport on ultrawide monitors), the chanhdai-style metadata
 * footer, and the floating mobile bottom-nav pill.
 *
 * Routes in this group: `/` (home), `/blog`, `/blog/[slug]`, `/og` (image
 * route — layouts don't apply to route handlers but co-located here for
 * organization), `/blog.mdx/[slug]` (raw markdown route — same caveat).
 *
 * The root `app/layout.tsx` is intentionally lean: only `<html>`, `<body>`,
 * fonts, theme provider, analytics. That split mirrors chanhdai's
 * `(app)/layout.tsx` vs root-layout separation so a future second shell
 * (e.g. a `(marketing)` landing page) can drop in without forking the
 * root layout.
 *
 * `group/layout` is a named Tailwind group — deep children can react to
 * layout-level state via `group-has-data-[slot=…]/layout:…` selectors.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="group/layout relative isolate">
      <SiteHeader />

      <main className="max-w-screen overflow-x-clip px-2">{children}</main>

      <Footer />

      {/* Soft fade + backdrop-blur strip that sits BEHIND the floating
          `<SiteBottomNav>` pill on mobile AND under the bottom edge of
          the page on desktop. Mirrors chanhdai's `(app)/layout.tsx`
          exactly — the gloomy/blurry bottom fade that makes content
          "dissolve into" the page edge on every viewport. Chanhdai
          renders this globally too; the fade sits over the FOOTER's
          bottom empty area (below the wordmark) so it doesn't cover
          real content — it just gives the very bottom of long pages a
          soft horizon. `z-50` so it sits above the page content. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50"
        aria-hidden
      >
        <div className="h-(--fade-bottom-height) bg-linear-to-b from-transparent to-background backdrop-blur-[1px] [mask-image:linear-gradient(to_top,var(--background)_25%,transparent)]" />
        <div className="bg-background pb-[env(safe-area-inset-bottom,0)]" />
      </div>

      <SiteBottomNav />
    </div>
  )
}
