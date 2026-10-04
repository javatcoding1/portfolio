import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Minimal spinner — matches the shadcn `spinner` API (used by GitHub
 *  contributions fallback). */
export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>) {
  return (
    <Loader2Icon
      className={cn("size-4 animate-spin", className)}
      aria-label="Loading"
      {...props}
    />
  )
}
