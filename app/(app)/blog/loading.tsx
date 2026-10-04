/**
 * Route-level loading UI for `/blog` — rendered by Next.js while the
 * blog index server component is streaming in. Shared visual with the
 * individual post route (`[slug]/loading.tsx`) so route transitions
 * feel like the same document family.
 */
export { default } from "@/components/blog/blog-loader"
