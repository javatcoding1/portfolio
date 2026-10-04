"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

const config = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
}

export function BlogComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isConfigured = Object.values(config).every(Boolean)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isConfigured) return

    container.replaceChildren()

    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.dataset.repo = config.repo!
    script.dataset.repoId = config.repoId!
    script.dataset.category = config.category!
    script.dataset.categoryId = config.categoryId!
    script.dataset.mapping = "pathname"
    script.dataset.strict = "1"
    script.dataset.reactionsEnabled = "1"
    script.dataset.emitMetadata = "0"
    script.dataset.inputPosition = "top"
    script.dataset.theme = resolvedTheme === "dark" ? "dark" : "light"
    script.dataset.lang = "en"
    script.dataset.loading = "lazy"
    container.appendChild(script)

    return () => container.replaceChildren()
  }, [isConfigured, resolvedTheme])

  if (!isConfigured) return null

  return (
    <section className="not-prose mt-10 border-t border-line pt-8" aria-labelledby="comments-title">
      <h2 id="comments-title" className="mb-5 text-xl font-medium">
        Comments
      </h2>
      <div ref={containerRef} />
    </section>
  )
}
