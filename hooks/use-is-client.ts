import { useSyncExternalStore } from "react"

/**
 * Returns `true` only after hydration, on the client. Use to gate browser-only
 * effects (window APIs, touch detection) so SSR + first-render stay identical
 * and React doesn't warn about hydration mismatches.
 */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}
