"use client"

import { useEffect, useRef } from "react"

/**
 * Measures the post title's bottom edge in document coordinates and writes
 * it to the `--doc-cols-top` CSS variable on `<html>`. The right-rail TOC
 * minimap consumes this so its sticky offset anchors to the title's
 * bottom-line — chanhdai's exact pattern. Re-measures on resize so text
 * reflow doesn't strand the minimap at a stale offset.
 *
 * Also flips `data-doc-cols-ready` on the wrapper once the variable is
 * populated; Tailwind's `in-data-doc-cols-ready:` variant uses that to
 * fade the minimap in only after measurement, avoiding a flash at the
 * wrong y position.
 */
export function DocPageRoot({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const docTitle = container.querySelector<HTMLElement>(
      '[data-slot="doc-title"]'
    )

    const update = () => {
      if (!docTitle) {
        document.documentElement.style.removeProperty("--doc-cols-top")
        container.removeAttribute("data-doc-cols-ready")
        return
      }
      const bottom = docTitle.getBoundingClientRect().bottom + window.scrollY
      document.documentElement.style.setProperty(
        "--doc-cols-top",
        `${bottom}px`
      )
      container.setAttribute("data-doc-cols-ready", "")
    }

    update()
    window.addEventListener("resize", update)

    return () => {
      window.removeEventListener("resize", update)
      document.documentElement.style.removeProperty("--doc-cols-top")
      container.removeAttribute("data-doc-cols-ready")
    }
  }, [])

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}
