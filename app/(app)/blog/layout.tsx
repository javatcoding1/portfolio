/**
 * Shared blog layout — applies to `/blog` and every `/blog/[slug]`. Adds
 * the 48px column-rail spacer between the sticky site header and the
 * page chrome (chanhdai's `(docs)/layout.tsx` pattern). Keeping this in
 * a shared layout means the spacer markup isn't duplicated in every
 * blog page (which is what the old `<div className="mx-auto h-12 ...">`
 * boilerplate did in `page.tsx` and `[slug]/page.tsx`).
 *
 * Each blog page is responsible for its own column container below this
 * spacer — `<DocContainer>` (blog index) or `<DocPageRoot>` + `<DocGrid>`
 * (post page).
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div
        className="mx-auto h-12 border-x border-line md:max-w-3xl"
        aria-hidden
      />
      {children}
    </>
  )
}
