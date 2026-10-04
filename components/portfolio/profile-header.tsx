import Image from "next/image"

import { TextFlip } from "@/components/text-flip"
import { AvatarLights } from "@/components/portfolio/avatar-lights"
import { PROFILE } from "@/config/profile"


/**
 * Hero header — port of the OLD legacy portfolio's ProfileCover +
 * ProfileHeader pair (chanhdai's legacy shape, kept as a single
 * exported component here for simpler wiring).
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │                                                          │
 *   │              COVER BANNER (aspect-2/1 mobile,             │
 *   │              aspect-3/1 sm+, edge-to-edge, no rounding)   │
 *   │                                                          │
 *   ├─────────────────┬─────────────────────────────────────────┤  ← screen-line
 *   │                 │  //// diagonal hatch spacer ////        │
 *   │     [avatar]    │  //// (fills vertical space) ////       │
 *   │   (top-left,    ├─────────────────────────────────────────┤  ← border-t
 *   │  fixed height)  │  Vijay Gatla                            │
 *   │                 ├─────────────────────────────────────────┤  ← border-t
 *   │                 │  flip tagline                           │
 *   └─────────────────┴─────────────────────────────────────────┘  ← screen-line
 *
 * KEY DIFFERENCES from the wizaye-only pattern I had before:
 *   • Cover is a distinct `aspect-2/1 sm:aspect-3/1` block (taller
 *     on mobile, wider on desktop) — legacy chanhdai's exact ratios.
 *   • Avatar cell is FIXED height (avatar + 3px margin ≈ 166px);
 *     the name area's diagonal-hatch spacer fills the vertical
 *     difference with a `flex-1 grow` block so the row naturally
 *     sizes to the avatar without any `min-h-*` hack.
 *   • The hatch spacer carries chanhdai's signature designer-note
 *     annotation showing the class name of the h1 below
 *     (``text-3xl text-zinc-950 font-medium`` in light,
 *      ``text-3xl text-zinc-50  font-medium`` in dark).
 *   • Avatar keeps our `<AvatarLights>` component which bundles
 *     chanhdai's on/off filter toggle (click or press `L`) with
 *     a single image + CSS filters (no need for 4 pre-rendered
 *     variants).
 *
 * CRITICAL: `overflow-y-clip` (Y only) NOT `overflow-hidden` (X+Y)
 * on the wrapper — the `screen-line-bottom` ::after pseudo bleeds
 * via `left:[-100vw] w-[200vw]` and clipping X kills that.
 */
export function ProfileHeader() {
  return (
    <>
      {/* (1) Cover banner — separate visual block above the header row.
          `aspect-2/1` on mobile (taller, more screen presence on small
          viewports) shifts to `aspect-3/1` on sm+ (wider letterbox on
          desktop).
          BORDERS: only `screen-line-bottom` — the TOP seam is drawn by
          the sticky SiteHeader's own `screen-line-bottom`; adding
          `screen-line-top` here would paint a doubled 2px line at
          y=header-height. `overflow-y-clip` (Y only, NOT `overflow-hidden`
          which is X+Y) so the ::after pseudo can bleed horizontally
          past the column rails and reach main's `overflow-x-clip`. */}
      <div className="screen-line-bottom relative aspect-2/1 overflow-y-clip border-x border-line sm:aspect-3/1">
        <Image
          src={PROFILE.coverImage}
          alt="Cover banner"
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          priority
          className="object-cover select-none"
        />
      </div>

      {/* (2) Avatar + name row. `flex` (not grid) — matches old
          legacy portfolio's exact structure. Avatar cell is fixed-width
          (avatar + tiny margin), name cell takes `flex-1`. The name
          cell's inner column has a `flex-1 grow` diagonal-hatch spacer
          at the top and the h1 + tagline stack at the bottom — the
          spacer soaks up whatever height difference exists between the
          avatar and the name+tagline. */}
      <div className="screen-line-bottom flex overflow-y-clip border-x border-line">
        <div className="flex shrink-0 items-center justify-center border-r border-line p-1">
          <AvatarLights
            src={PROFILE.avatar}
            alt={`${PROFILE.displayName} avatar`}
          />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="diagonal-stripes grow" aria-hidden />

          <div className="border-t border-line">
            <h1 className="flex items-center px-3 py-1 text-3xl font-medium tracking-tight">
              {PROFILE.displayName}
            </h1>

            {/* Tagline cycles through `PROFILE.flipSentences`. */}
            <div className="h-11 border-t border-line px-3 py-1.5 text-sm text-muted-foreground sm:h-auto sm:text-base">
              <TextFlip
                className="text-balance"
                interval={4}
                transition={{ duration: 0.35 }}
              >
                {PROFILE.flipSentences.map((sentence) => (
                  <span key={sentence}>{sentence}</span>
                ))}
              </TextFlip>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
