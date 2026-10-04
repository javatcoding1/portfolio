import {
  Panel,
  PanelHeader,
  PanelTitle,
} from "@/components/panel"
import { STACK } from "@/config/profile"

import { STACK_ICON_REGISTRY } from "./stack-icons"

/**
 * Categorized stack. Each category gets a two-column row: label on the
 * left, tools on the right.
 * Categories stack vertically; rows are separated by a hairline.
 *
 * Add or rearrange categories in `config/profile.ts` (`STACK`). New
 * technologies need a Simple-Icons entry in
 * `components/portfolio/stack-icons.tsx`.
 */
export function Stack() {
  return (
    <Panel id="stack">
      <PanelHeader>
        <PanelTitle>
          <a href="#stack">Stack</a>
        </PanelTitle>
      </PanelHeader>

      <div className="relative [--col-left-width:--spacing(40)]">
        {/* Vertical dashed separator between the category label column and
            the chips column. Positioned at `left-(--col-left-width)` so it
            sits exactly at the column boundary. Hidden on mobile (when the
            grid collapses to a single column). Chanhdai pattern. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-(--col-left-width) -z-1 w-px bg-[linear-gradient(to_bottom,var(--line)_4px,transparent_2px)] bg-[length:1px_6px] bg-repeat-y max-sm:hidden"
          aria-hidden
        />

        {STACK.map((category) => (
          <div
            key={category.label}
            className="grid grid-cols-[auto_1fr] items-start gap-y-2 border-b border-line py-3 last:border-b-0 sm:grid-cols-[var(--col-left-width)_1fr]"
          >
            <div className="px-4 font-mono text-sm text-foreground">
              <span>{category.label}</span>
            </div>

            <ul className="flex flex-wrap gap-1.5 px-4">
              {category.items.map(({ name, iconKey }) => {
                const Icon = iconKey ? STACK_ICON_REGISTRY[iconKey] : undefined
                return (
                  <li key={name}>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-50/80 px-2 py-0.5 font-mono text-xs text-foreground dark:bg-zinc-900/80">
                      {Icon && (
                        <Icon
                          className="size-3 text-muted-foreground/80"
                          color="default"
                          aria-hidden
                        />
                      )}
                      <span>{name}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  )
}
