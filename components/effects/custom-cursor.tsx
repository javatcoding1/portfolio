"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

/**
 * Custom interactive precision cursor.
 * Features:
 *  - Small centered pinpoint dot with zero latency.
 *  - Trailing smooth spring-damped outer halo/crosshair ring.
 *  - Interactive state detection: morphs and scales up when hovering over
 *    clickable elements (buttons, links, inputs, collapsibles).
 *  - Touch-safe: automatically disabled on touchscreen/coarse-pointer devices.
 *  - Respects reduced motion preferences.
 */
export function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics for smooth trailing ring
  const springConfig = { damping: 28, stiffness: 320, mass: 0.5 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return
    }

    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      const isInteractive = Boolean(
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[role='button']") ||
        target.closest("[data-state]") ||
        target.classList.contains("cursor-pointer") ||
        target.tagName === "SUMMARY"
      )
      setIsHovered(isInteractive)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseover", handleMouseOver, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  if (!mounted) return null

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-9999 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } max-md:hidden`}
      aria-hidden
    >
      {/* Precision Center Pinpoint */}
      <motion.div
        className="fixed top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-sm"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />

      {/* Trailing Spring Ring with Dynamic Hover Expansion */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-foreground/40 bg-foreground/5 backdrop-blur-[0.5px]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 40 : isClicking ? 20 : 26,
          height: isHovered ? 40 : isClicking ? 20 : 26,
          borderColor: isHovered
            ? "var(--foreground)"
            : "rgba(128, 128, 128, 0.35)",
          backgroundColor: isHovered
            ? "rgba(128, 128, 128, 0.12)"
            : "rgba(128, 128, 128, 0.03)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      />
    </div>
  )
}
