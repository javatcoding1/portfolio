/**
 * Route-level loading UI for `/blog/[slug]` — rendered by Next.js
 * while the MDX post is being fetched + compiled server-side. First
 * cold hit is measurably slow because the whole MDX pipeline
 * (`rehype-pretty-code` / Shiki / `remark-mermaid`) is loaded lazily
 * per post; this fallback gives readers immediate feedback instead of
 * a blank page.
 */
export { default } from "@/components/blog/blog-loader";
