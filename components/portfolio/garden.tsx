import { SproutIcon } from "lucide-react"

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel"
import { PetCompanion } from "@/components/garden/pet-companion"

/**
 * Garden — a contained patch of the page where the pet companion lives.
 * Background is an 8-bit pixel-art grass tile repeated, swapping to a
 * darker palette in dark mode. Mostly empty by design: the pet is the
 * content. Click inside the patch to send the pet walking there.
 *
 * Position is `relative` because `PetCompanion` mounts an `absolute`-positioned
 * child that uses the patch as its bounding box. Height is fixed via Tailwind
 * (h-56 = 224px) so the pet has somewhere to roam.
 *
 * Sits between two `<Separator />` strips on the home page (Intro → Sep
 * → Garden → Sep → Stack), so it carries BOTH `screen-line-top` and
 * `screen-line-bottom` from `<Panel>` — NO opt-out. Removing the bottom
 * line was leaving a visible gap in the column rail.
 */
export function Garden() {
  return (
    <Panel id="garden">
      <PanelHeader>
        <PanelTitle>
          <a href="#garden">Garden</a>
        </PanelTitle>
      </PanelHeader>

      <PanelContent className="relative h-56 overflow-hidden p-0">
        {/* 8-bit grass tile, light + dark palettes. `image-rendering: pixelated`
            on the host (.pet-companion CSS) carries over inside the panel via
            the inline style here. Tile size kept small so blades read at scale. */}
        <div
          className="absolute inset-0 -z-1 bg-repeat dark:hidden"
          style={{
            backgroundImage: "url('/garden-grass.svg')",
            backgroundSize: "32px 32px",
            imageRendering: "pixelated",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-1 hidden bg-repeat dark:block"
          style={{
            backgroundImage: "url('/garden-grass-dark.svg')",
            backgroundSize: "32px 32px",
            imageRendering: "pixelated",
          }}
          aria-hidden
        />

        {/* Faint horizon line + sprout marker — purely decorative. */}
        <div
          className="pointer-events-none absolute right-3 bottom-3 z-1 flex items-center gap-1 rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] text-foreground/80 backdrop-blur-sm"
          aria-hidden
        >
          <SproutIcon className="size-3" />
          <span className="font-mono">noir-webling</span>
        </div>

        <PetCompanion />
      </PanelContent>
    </Panel>
  )
}
