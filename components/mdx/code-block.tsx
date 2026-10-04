"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/doc/copy-button"
import { getIconForLanguage } from "@/components/icons/language-icons"
import { PackageManagerIcon } from "@/components/icons/package-manager-icons"

/* ─────────────────────────────────────────────────────────────────────────
   Shared shell
   ─────────────────────────────────────────────────────────────────────── */

/**
 * Outer card + nested code card with an optional header (label / tabs) on
 * top and an optional copy button on the right. Used by BOTH the default
 * MDX code-block mapping and the multi-PM `<PackageInstall>` family.
 */
function CodeBlockShell({
  header,
  copyText,
  children,
}: {
  /** Left side of the header row — language label, PM tabs, etc. */
  header?: React.ReactNode
  /** Raw source for the copy-to-clipboard button. */
  copyText?: string
  /** Inner content — the `<pre>` (with token spans) or whatever else. */
  children: React.ReactNode
}) {
  return (
    <div className="not-prose group/code relative my-6 rounded-[9px] border border-border bg-card p-1.5">
      {(header || copyText) && (
        <div className="relative flex items-center justify-between pl-2 pr-0.5">
          <div className="flex min-w-0 items-center">{header}</div>
          {copyText ? (
            <CopyButton
              text={copyText}
              label="Copy code"
              copiedLabel="Copied to clipboard"
            />
          ) : null}
        </div>
      )}

      <div className="mt-1 overflow-hidden rounded-[7px] border border-border bg-background">
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   MDX `pre` mapping — single-language code block
   ─────────────────────────────────────────────────────────────────────── */

/**
 * Renders a fenced markdown code block. The header shows the language icon
 * + name; the body is the rehype-pretty-code output. Raw source is mirrored
 * down by `rehypeMirrorCodeRawToPre` so the copy button has something to copy.
 */
export function CodeBlock({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLPreElement> & Record<string, unknown>) {
  const rawProp = rest["data-raw"]
  const langProp = rest["data-language"]
  const raw = typeof rawProp === "string" ? rawProp : undefined
  const lang = typeof langProp === "string" ? langProp : undefined

  // Strip our custom data-raw before forwarding to the DOM `<pre>` — it's
  // not a real HTML attribute and React will warn at runtime.
  const { ["data-raw"]: _omit, ...preProps } = rest
  void _omit

  const hasLang = lang && lang !== "plaintext"

  return (
    <CodeBlockShell
      copyText={raw}
      header={
        hasLang ? (
          <>
            <span
              aria-hidden
              className="mr-2 inline-flex size-4 items-center justify-center text-muted-foreground"
            >
              {getIconForLanguage(lang)}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {lang}
            </span>
          </>
        ) : null
      }
    >
      <pre {...preProps} className={cn(className)}>
        {children}
      </pre>
    </CodeBlockShell>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   Package-manager tabs — multi-language code block
   ─────────────────────────────────────────────────────────────────────── */

type PackageManager = "pnpm" | "yarn" | "npm" | "bun"

const PMS: readonly PackageManager[] = ["pnpm", "yarn", "npm", "bun"] as const

type Action = "install" | "install-dev" | "run" | "exec" | "create"

function commandFor(pm: PackageManager, action: Action, args: string): string {
  switch (action) {
    case "install":
      return pm === "npm"
        ? `npm install ${args}`
        : pm === "pnpm"
          ? `pnpm add ${args}`
          : pm === "yarn"
            ? `yarn add ${args}`
            : `bun add ${args}`
    case "install-dev":
      return pm === "npm"
        ? `npm install -D ${args}`
        : pm === "pnpm"
          ? `pnpm add -D ${args}`
          : pm === "yarn"
            ? `yarn add -D ${args}`
            : `bun add -d ${args}`
    case "run":
      return pm === "npm"
        ? `npm run ${args}`
        : pm === "pnpm"
          ? `pnpm ${args}`
          : pm === "yarn"
            ? `yarn ${args}`
            : `bun run ${args}`
    case "exec":
      return pm === "npm"
        ? `npx ${args}`
        : pm === "pnpm"
          ? `pnpm dlx ${args}`
          : pm === "yarn"
            ? `yarn dlx ${args}`
            : `bunx ${args}`
    case "create":
      return pm === "npm"
        ? `npm create ${args}`
        : pm === "pnpm"
          ? `pnpm create ${args}`
          : pm === "yarn"
            ? `yarn create ${args}`
            : `bun create ${args}`
  }
}

const STORAGE_KEY = "pf:pm"

function readStoredPm(): PackageManager {
  if (typeof window === "undefined") return "pnpm"
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v && (PMS as readonly string[]).includes(v)
    ? (v as PackageManager)
    : "pnpm"
}

/**
 * Hook that keeps the user's selected package manager in sync across every
 * `<PackageInstall>` on the page (and persisted across reloads + tabs).
 */
function usePackageManager(): readonly [
  PackageManager,
  (next: PackageManager) => void,
] {
  const pm = React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange)
      return () => window.removeEventListener("storage", onChange)
    },
    readStoredPm,
    (): PackageManager => "pnpm"
  )

  const setActive = React.useCallback((next: PackageManager) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
      // `storage` only fires across tabs; synthesise one for in-page sync.
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: next })
      )
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [])

  return [pm, setActive] as const
}

function PackageManagerTabs({ action, args }: { action: Action; args: string }) {
  const [pm, setPm] = usePackageManager()

  // Track the active tab's geometry so the underline indicator animates
  // smoothly between tabs.
  const tabRefs = React.useRef<Map<PackageManager, HTMLButtonElement | null>>(
    new Map()
  )
  const [indicator, setIndicator] = React.useState<{
    left: number
    width: number
  } | null>(null)

  React.useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current.get(pm)
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [pm])

  const current = commandFor(pm, action, args)

  const header = (
    <>
      <span
        aria-hidden
        className="mr-2 inline-flex size-4 items-center justify-center text-muted-foreground"
      >
        <PackageManagerIcon manager={pm} />
      </span>

      <div role="tablist" aria-label="Package manager" className="relative flex">
        {PMS.map((id) => {
          const active = pm === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setPm(id)}
              ref={(el) => {
                tabRefs.current.set(id, el)
              }}
              className={cn(
                "relative h-9 px-2 font-mono text-sm transition-colors",
                "focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {id}
            </button>
          )
        })}

        {indicator ? (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-1 h-0.5 rounded-full bg-foreground transition-[left,width] duration-200 ease-out"
            style={{
              left: `${indicator.left}px`,
              width: `${indicator.width}px`,
            }}
          />
        ) : null}
      </div>
    </>
  )

  return (
    <CodeBlockShell copyText={current} header={header}>
      <pre className="overflow-x-auto overscroll-x-contain px-3 py-2.5 font-mono text-sm leading-5 text-muted-foreground">
        <code>{current}</code>
      </pre>
    </CodeBlockShell>
  )
}

function asText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(asText).join("")
  return ""
}

/**
 * Install one or more packages, with tabs for pnpm / yarn / npm / bun.
 *
 *   <PackageInstall>zod react-hook-form</PackageInstall>
 *   <PackageInstall dev>vitest @testing-library/react</PackageInstall>
 */
export function PackageInstall({
  children,
  dev,
}: {
  children: React.ReactNode
  dev?: boolean
}) {
  const args = asText(children).trim()
  return <PackageManagerTabs action={dev ? "install-dev" : "install"} args={args} />
}

/**
 * Run a script from `package.json` with the user's preferred package manager.
 *
 *   <PackageRun>dev</PackageRun>
 */
export function PackageRun({ children }: { children: React.ReactNode }) {
  return <PackageManagerTabs action="run" args={asText(children).trim()} />
}

/**
 * Execute a one-off binary (npx / pnpm dlx / yarn dlx / bunx).
 *
 *   <PackageExec>shadcn@latest add button</PackageExec>
 */
export function PackageExec({ children }: { children: React.ReactNode }) {
  return <PackageManagerTabs action="exec" args={asText(children).trim()} />
}

/**
 * Scaffold a new project (npm create / pnpm create / etc).
 *
 *   <PackageCreate>next-app@latest my-app</PackageCreate>
 */
export function PackageCreate({ children }: { children: React.ReactNode }) {
  return <PackageManagerTabs action="create" args={asText(children).trim()} />
}

