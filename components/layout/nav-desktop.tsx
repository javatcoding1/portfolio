"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export type NavItem = {
  title: string
  href: string
}

/**
 * Desktop inline nav. Renders one link per item, highlighting the active
 * route via underlined text. Hidden on mobile (caller decides — currently
 * always visible since we're not adding a hamburger).
 */
export function NavDesktop({
  items,
  className,
}: {
  items: NavItem[]
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-2 py-1 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
