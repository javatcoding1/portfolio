"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"

import { useIsClient } from "@/hooks/use-is-client"

const PetCompanionCore = dynamic(
  () => import("@/components/garden/pet-companion-core"),
  { ssr: false }
)

/**
 * Container-bounded pet companion. Adapted from chanhdai.com's
 * `DuckFollower` to live inside a parent element (the Garden panel) instead
 * of the whole viewport. Disabled only when the user opts out of motion
 * (`prefers-reduced-motion: reduce`). The pet is autonomous + click-driven
 * (not cursor-following) so it works on touch devices.
 *
 * The host element is responsible for setting `position: relative` and
 * having a stable height — see `components/portfolio/garden.tsx`.
 */
export function PetCompanion() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isClient = useIsClient()
  const shouldReduceMotion = useReducedMotion()
  const shouldRender = isClient && !shouldReduceMotion

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-pointer select-none"
    >
      {shouldRender && <PetCompanionCore containerRef={containerRef} />}
    </div>
  )
}
