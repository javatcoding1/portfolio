import { listBlogPosts } from "@/app/(app)/blog/utils";
import { PROFILE } from "@/config/profile";
import { SITE_INFO } from "@/config/site";

/**
 * `/llms.txt` — machine-readable site index following the emerging
 * [llms.txt](https://llmstxt.org) convention. Chatbots and retrieval
 * agents (Perplexity, ChatGPT deep research, You.com, etc.) look for
 * this file at the site root when deciding what content is worth
 * ingesting from a domain.
 *
 * Format is intentionally plain Markdown — a title, a one-line
 * description, and grouped link lists. Mirrors chanhdai.com's
 * `/llms.txt` shape but scoped to what THIS site actually publishes
 * (an About paragraph + the blog index; no shadcn registry).
 *
 * Force-static + `revalidate: false` so it's baked at build time and
 * served from the CDN like any other static asset.
 */

export const revalidate = false;
export const dynamic = "force-static";

function buildContent(): string {
  const posts = listBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );

  const blogSection = posts
    .map((post) => {
      const topics = [post.metadata.category, ...(post.metadata.tags ?? [])]
        .filter(Boolean)
        .join(", ");
      return `- [${post.metadata.title}](${SITE_INFO.url}/blog.mdx/${post.slug}): ${post.metadata.summary}${topics ? ` Topics: ${topics}.` : ""}`;
    })
    .join("\n");

  return `# ${SITE_INFO.name}

> ${SITE_INFO.description}

${PROFILE.about}

## Site

- [Home](${SITE_INFO.url}): Overview, experience, projects, and contact details.
- [Blog](${SITE_INFO.url}/blog): Notes on software engineering, problem solving, developer tools, and building for the web.
- [Stats](${SITE_INFO.url}/stats): Privacy-friendly, aggregate traffic and per-post readership from Vercel Web Analytics.
- [Credits](${SITE_INFO.url}/credits): People, tools, and services this site is built on.
- [RSS Feed](${SITE_INFO.url}/rss.xml): Subscribe to new blog posts.

## Blog

${blogSection}
`;
}

export function GET() {
  return new Response(buildContent(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
