/**
 * Tiny clipboard helper used by the share menu and other "copy link" UIs.
 * Returns true on success so callers can show toast feedback without
 * having to wrap navigator.clipboard.writeText in a try/catch each time.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
