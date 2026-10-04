import { BlogSearchAndPosts } from '@/components/blog/blog-search-and-posts'
import { DocContainer } from '@/components/doc/doc-layout'
import {
  PageHeading,
  PageHeadingTagline,
  PageHeadingTitle,
} from '@/components/page-heading'
import { listBlogPosts } from '@/app/(app)/blog/utils'

export const metadata = {
  title: 'Blog',
  description: 'Field notes on distributed systems, developer tools, and building for the web.',
}

export default function Page() {
  const allPosts = [...listBlogPosts()].sort((a, b) =>
    new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt) ? -1 : 1
  )

  return (
    <>
      {/* 48px header-to-content spacer is provided by `(app)/blog/layout.tsx`
          (chanhdai's shared `(docs)` pattern) — don't duplicate it here. */}
      <DocContainer>
        <PageHeading>
          <PageHeadingTagline>Blog</PageHeadingTagline>
          <PageHeadingTitle>
            Field notes on systems, tools, and building for the web.
          </PageHeadingTitle>
        </PageHeading>

        <BlogSearchAndPosts posts={allPosts} />
      </DocContainer>
    </>
  )
}
