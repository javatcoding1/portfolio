"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useHotkeys } from "react-hotkeys-hook"

import { META_THEME_COLORS } from "@/config/site"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"
import { useIsClient } from "@/hooks/use-is-client"
import { useMetaColor } from "@/hooks/use-meta-color"

import { MoonIcon } from "@/components/animated-icons/moon-icon"
import { SunMediumIcon } from "@/components/animated-icons/sun-medium-icon"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {Kbd} from "@/components/ui/kbd"

export function ThemeToggle() {
  const mounted = useIsClient()
  const { resolvedTheme, setTheme } = useTheme()

  const { setMetaColor } = useMetaColor()

  const [click] = useClickSound()

  // Track the "next" theme across rapid toggles so we don't stale-read
  // `resolvedTheme` from closure. next-themes' setTheme is fire-and-forget
  // — pressing D five times fast otherwise sees the same closure value and
  // commits the same direction five times.
  const pendingThemeRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    // Once the actual theme catches up to our pending value, clear it so
    // the next toggle reads from `resolvedTheme` again.
    if (
      pendingThemeRef.current !== null &&
      pendingThemeRef.current === resolvedTheme
    ) {
      pendingThemeRef.current = null
    }
  }, [resolvedTheme])

  const switchTheme = React.useCallback(() => {
    const current = pendingThemeRef.current ?? resolvedTheme
    const next = current === "dark" ? "light" : "dark"
    pendingThemeRef.current = next

    click()
    setTheme(next)
    setMetaColor(
      next === "dark"
        ? META_THEME_COLORS.dark
        : META_THEME_COLORS.light
    )
  }, [resolvedTheme, setTheme, setMetaColor, click])

  useHotkeys("d", switchTheme, { preventDefault: true }, [switchTheme])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="relative touch-manipulation border-none text-current"
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle mode"
          onClick={switchTheme}
        >
          <span
            className="absolute size-12 pointer-fine:hidden"
            aria-hidden
          />
          {mounted ? (
            resolvedTheme === 'dark' ? (
              <SunMediumIcon aria-hidden />
            ) : (
              <MoonIcon aria-hidden />
            )
          ) : (
            <div className="size-6" /> /* Placeholder size for the icon */
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          Toggle mode
          <Kbd>D</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
