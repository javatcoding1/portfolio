import Link from "next/link"
import { ArrowLeftIcon, HouseIcon } from "lucide-react"

import { DocContainer } from "@/components/doc/doc-layout"
import { Button } from "@/components/ui/button"

export function NotFoundPage({
  resource = "Page",
  scope = "Site",
}: {
  resource?: "Page" | "Post"
  scope?: "Site" | "Blog"
}) {
  return (
    <DocContainer className="relative isolate min-h-[calc(100svh-10rem)] overflow-hidden">
      <div
        className="pointer-events-none absolute -right-4 top-1/2 -z-1 -translate-y-1/2 font-mono text-[clamp(9rem,30vw,18rem)] leading-none font-semibold tracking-[-0.1em] text-muted/70 select-none"
        aria-hidden
      >
        404
      </div>

      <section className="flex min-h-[calc(100svh-10rem)] items-center px-4 py-20 sm:px-8">
        <div className="max-w-lg">
          <p className="mb-4 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Route miss · {scope}
          </p>
          <h1 className="text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            {resource} not found.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            This {resource.toLowerCase()} does not exist, or its URL changed.
            Browse published notes or return home.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/blog">
                <ArrowLeftIcon data-icon="inline-start" />
                Browse posts
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <HouseIcon data-icon="inline-start" />
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </DocContainer>
  )
}
