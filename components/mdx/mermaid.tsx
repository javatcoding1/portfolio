"use client"

import {
  Copy,
  Download,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type MermaidApi = typeof import("mermaid").default

/** Minimal subset of svg-pan-zoom's API surface that we actually use. */
type PanZoomInstance = {
  getPan: () => { x: number; y: number }
  getZoom: () => number
  pan: (point: { x: number; y: number }) => void
  zoom: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  center: () => void
  fit: () => void
  destroy: () => void
}
type PanZoomFn = (
  svgElement: SVGElement,
  options?: Record<string, unknown>
) => PanZoomInstance

let mermaidPromise: Promise<MermaidApi> | null = null

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default)
  }
  return mermaidPromise
}

let panZoomPromise: Promise<PanZoomFn> | null = null

function loadPanZoom(): Promise<PanZoomFn> {
  if (!panZoomPromise) {
    panZoomPromise = import("svg-pan-zoom").then(
      // svg-pan-zoom uses CommonJS `export =`; depending on the bundler
      // the function lives on `.default`, otherwise the module IS the fn.
      (m) =>
        (((m as unknown) as { default?: PanZoomFn }).default ??
          (m as unknown as PanZoomFn)) as PanZoomFn
    )
  }
  return panZoomPromise
}

/**
 * Module-level cache: rendered SVG strings keyed by `${theme}|${chart}`.
 *
 * Rendering mermaid is a multi-millisecond synchronous JS task. With 8
 * diagrams on a page, a naive theme toggle re-runs all of them and the
 * main thread visibly stalls. Cache hits make rapid `D` toggles snappy.
 */
const mermaidCache = new Map<string, string>()
const cacheKey = (theme: string, chart: string) => `${theme}|${chart}`

let mermaidInitializedForTheme: string | null = null

// Monotonic counter so each `mermaid.render()` call gets a unique element id.
// Mermaid uses this id internally for a temporary SVG element; if it ever
// collides with an SVG we already have mounted (e.g. the one shown in the
// fullscreen modal while a re-render is in flight), mermaid's cleanup yanks
// the wrong one out of the DOM and the image visibly vanishes.
let mermaidRenderCounter = 0

/**
 * Global mermaid mutex. `mermaid.initialize()` and `mermaid.render()` both
 * touch the library's module-level state — running them concurrently (e.g.
 * 8 diagrams on a page + a rapid theme toggle) lets one render start with
 * the theme another render is mid-way through swapping. The visible bug:
 * the diagram blanks out or renders with the wrong palette.
 *
 * Chaining every mermaid task onto a single promise serialises them so
 * each completes before the next begins. Rejected tasks are swallowed
 * from the chain (`.catch`) so one failure doesn't poison the queue.
 */
let mermaidQueue: Promise<unknown> = Promise.resolve()

function queueMermaid<T>(task: (mermaid: MermaidApi) => Promise<T>): Promise<T> {
  const result = mermaidQueue.then(() => loadMermaid().then(task))
  mermaidQueue = result.catch(() => undefined)
  return result
}

function ToolbarButton({
  onClick,
  label,
  children,
  className,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md",
        "border border-border bg-background/85 text-muted-foreground backdrop-blur-sm",
        "transition-colors hover:bg-background hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children}
    </button>
  )
}

export function Mermaid({
  chart,
  className,
}: {
  chart: string
  className?: string
}) {
  const reactId = React.useId().replace(/[^a-zA-Z0-9-_]/g, "")
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const theme = resolvedTheme === "dark" ? "dark" : "default"

    // Cache hit — synchronous swap, no mermaid invocation.
    const cached = mermaidCache.get(cacheKey(theme, chart))
    if (cached !== undefined) {
      queueMicrotask(() => {
        if (!cancelled) {
          setError(null)
          setSvg(cached)
        }
      })
      return () => {
        cancelled = true
      }
    }

    // Serialise mermaid operations across the whole page so concurrent
    // renders (8 diagrams) and rapid theme toggles can't interleave each
    // other's `initialize()` / `render()` calls.
    queueMermaid(async (mermaid) => {
      // Discard stale tasks before doing any work — the effect may have
      // been re-run with a new theme while we were waiting in the queue.
      if (cancelled) return

      if (mermaidInitializedForTheme !== theme) {
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "strict",
          fontFamily:
            "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        })
        mermaidInitializedForTheme = theme
      }

      const renderId = `mermaid-${reactId}-${++mermaidRenderCounter}`
      const { svg: rendered } = await mermaid.render(renderId, chart)
      if (cancelled) return
      mermaidCache.set(cacheKey(theme, chart), rendered)
      setError(null)
      setSvg(rendered)
    }).catch((e) => {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })

    return () => {
      cancelled = true
    }
  }, [chart, reactId, resolvedTheme])

  const copySource = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(chart)
    } catch {
      /* ignore */
    }
  }, [chart])

  const downloadSvg = React.useCallback(() => {
    if (!svg) return
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram.svg"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [svg])

  if (error) {
    return (
      <pre
        className={cn(
          "not-prose my-6 overflow-x-auto rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive",
          className
        )}
        role="alert"
      >
        Mermaid render error: {error}
        {"\n\n"}
        {chart}
      </pre>
    )
  }

  if (!svg) {
    return (
      <div
        className={cn(
          "not-prose my-6 flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-muted/30 p-8 text-sm text-muted-foreground",
          className
        )}
        aria-busy="true"
      >
        Rendering diagram…
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "not-prose group/mermaid relative my-6 overflow-x-auto rounded-lg border border-border bg-background p-4",
          className
        )}
        role="img"
        aria-label="Mermaid diagram"
      >
        <div
          className="flex justify-center [&_svg]:max-w-full"
          // Mermaid sanitises its own SVG output (securityLevel: "strict");
          // the chart source itself is author-controlled MDX content.
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div
          className={cn(
            "absolute right-2 top-2 flex gap-1 transition-opacity",
            "opacity-0 group-hover/mermaid:opacity-100 focus-within:opacity-100"
          )}
        >
          <ToolbarButton onClick={copySource} label="Copy source">
            <Copy className="size-3.5" aria-hidden />
          </ToolbarButton>
          <ToolbarButton onClick={downloadSvg} label="Download SVG">
            <Download className="size-3.5" aria-hidden />
          </ToolbarButton>
          <DialogTrigger asChild>
            <ToolbarButton
              onClick={() => setOpen(true)}
              label="Open in fullscreen"
            >
              <Maximize2 className="size-3.5" aria-hidden />
            </ToolbarButton>
          </DialogTrigger>
        </div>
      </div>

      <DialogContent
        // Need both `max-w-4xl` AND `sm:max-w-4xl` because the default
        // DialogContent has `sm:max-w-sm` (384px) which would otherwise cap
        // this modal to a narrow column at any viewport ≥ 640px.
        // Sized for "read the diagram comfortably" — capped at 896px wide
        // and 75vh tall so it doesn't dominate the screen on large monitors.
        className="h-[75vh] w-[95vw] max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          // Stop Radix from auto-focusing the first focusable child (the
          // "Zoom out" toolbar button) when the dialog opens; the visible
          // focus-visible ring on that button reads as a UI bug.
          e.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">Diagram (fullscreen)</DialogTitle>
        <MermaidFullscreen
          svg={svg}
          chart={chart}
          onCopy={copySource}
          onDownload={downloadSvg}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function MermaidFullscreen({
  svg,
  onCopy,
  onDownload,
  onClose,
}: {
  svg: string
  chart: string
  onCopy: () => void
  onDownload: () => void
  onClose: () => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const panZoomRef = React.useRef<PanZoomInstance | null>(null)
  const viewportRef = React.useRef<{
    zoom: number
    pan: { x: number; y: number }
  } | null>(null)

  // Manually own the SVG swap so a theme toggle while the dialog is open
  // doesn't race React's diff cycle against svg-pan-zoom's DOM mutations.
  // (The previous `dangerouslySetInnerHTML + key={svg}` approach caused the
  // image to vanish on rapid theme changes because the new <div> mounted
  // before the cleanup-via-ref could see the old svg-pan-zoom instance.)
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false

    const destroyCurrent = () => {
      const current = panZoomRef.current
      if (!current) return

      try {
        viewportRef.current = {
          zoom: current.getZoom(),
          pan: current.getPan(),
        }
      } catch {
        /* ignore */
      }

      try {
        current.destroy()
      } catch {
        /* ignore */
      }
      panZoomRef.current = null
    }

    // Preserve the viewport before replacing the themed SVG.
    destroyCurrent()

    container.innerHTML = svg
    const svgEl = container.querySelector("svg")
    if (!svgEl) return

    // Make the SVG fill its container regardless of mermaid's intrinsic size.
    svgEl.removeAttribute("width")
    svgEl.removeAttribute("height")
    svgEl.style.width = "100%"
    svgEl.style.height = "100%"
    svgEl.style.maxWidth = "none"
    svgEl.style.cursor = "grab"

    loadPanZoom()
      .then((svgPanZoom) => {
        if (cancelled) return
        // The container may have been replaced again during the async load
        // (rapid theme toggles); re-query the current SVG.
        const liveSvg = container.querySelector("svg")
        if (!liveSvg) return
        const instance = svgPanZoom(liveSvg, {
          controlIconsEnabled: false,
          zoomEnabled: true,
          panEnabled: true,
          fit: true,
          center: true,
          minZoom: 0.5,
          maxZoom: 10,
          contain: false,
          dblClickZoomEnabled: true,
          mouseWheelZoomEnabled: true,
        })
        panZoomRef.current = instance

        const viewport = viewportRef.current
        if (viewport) {
          instance.zoom(viewport.zoom)
          instance.pan(viewport.pan)
        }
      })
      .catch(() => {
        /* ignore: fall back to static SVG */
      })

    return () => {
      cancelled = true
      destroyCurrent()
    }
  }, [svg])

  const handleZoomIn = () => panZoomRef.current?.zoomIn()
  const handleZoomOut = () => panZoomRef.current?.zoomOut()
  const handleReset = () => {
    panZoomRef.current?.resetZoom()
    panZoomRef.current?.center()
    panZoomRef.current?.fit()
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-hidden"
      />

      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <div className="pointer-events-auto flex gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-sm backdrop-blur-sm">
          <ToolbarButton
            onClick={handleZoomOut}
            label="Zoom out"
            className="border-0 bg-transparent"
          >
            <Minus className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleReset}
            label="Reset zoom"
            className="border-0 bg-transparent"
          >
            <RotateCcw className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton
            onClick={handleZoomIn}
            label="Zoom in"
            className="border-0 bg-transparent"
          >
            <Plus className="size-4" aria-hidden />
          </ToolbarButton>
          <div className="mx-1 w-px self-stretch bg-border" aria-hidden />
          <ToolbarButton
            onClick={onCopy}
            label="Copy source"
            className="border-0 bg-transparent"
          >
            <Copy className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton
            onClick={onDownload}
            label="Download SVG"
            className="border-0 bg-transparent"
          >
            <Download className="size-4" aria-hidden />
          </ToolbarButton>
        </div>
      </div>

      <ToolbarButton
        onClick={onClose}
        label="Close"
        className="absolute right-3 top-3"
      >
        <span className="text-lg leading-none">×</span>
      </ToolbarButton>
    </div>
  )
}
