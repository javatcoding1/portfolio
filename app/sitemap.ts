import { listBlogPosts } from "@/app/(app)/blog/utils";
import { SITE_INFO } from "@/config/site";

export const baseUrl = SITE_INFO.url;

export default async function sitemap() {
  const blogs = listBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ["", "/blog", "/stats", "/credits"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
