import { cn } from "@/lib/utils"

/**
 * E Jayanth Madhav brand mark — pixel-art / geometric `JM` monogram.
 * Uses viewBox `0 0 512 256`, `fill="currentColor"` so it inherits the
 * parent text color and flips cleanly between light and dark themes.
 */
export function JMMark({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 512 256"
      aria-hidden
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      {/* Letter 'J' */}
      <path
        fill="currentColor"
        d="
          M192 0H64v64h128V0Z
          M192 64h-64v128h-64v-64H0v64h64v64h128V64Z
        "
      />
      {/* Letter 'M' */}
      <path
        fill="currentColor"
        d="
          M256 0h64v256h-64V0Z
          M448 0h64v256h-64V0Z
          M320 64h64v64h-64V64Z
          M384 64h64v64h-64V64Z
          M352 128h32v64h-32v-64Z
        "
      />
    </svg>
  )
}

/** Re-export as VGMark for backward compatibility if any legacy imports remain */
export const VGMark = JMMark
