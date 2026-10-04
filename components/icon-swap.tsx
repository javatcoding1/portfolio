"use client"

import { AnimatePresence, motion } from "motion/react"

/**
 * `IconSwap` — animated icon swap using motion's popLayout AnimatePresence
 * pattern (verbatim from chanhdai's `registry/components/icon-swap/`).
 *
 * Wrap a keyed child (or `<IconSwapItem key={state}>`) and every key
 * change fades + scales + blurs the old icon out while the new one
 * springs in. Used by the "Copy page" button, theme toggler, etc.
 */
export function IconSwap({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {children}
    </AnimatePresence>
  )
}

/**
 * A single motion.span child of `<IconSwap>`. Give it a unique `key` for
 * each icon state and it'll animate on swap.
 */
export function IconSwapItem({
  children,
  ...props
}: React.ComponentProps<typeof motion.span>) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      {...props}
    >
      {children}
    </motion.span>
  )
}
