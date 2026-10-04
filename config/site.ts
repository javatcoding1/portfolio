/**
 * Site-level configuration — single source of truth for everything the
 * site SHELL needs (nav, footer, theme colors, source-code links).
 * Personal data (jobs, projects, awards, etc.) lives in `config/profile.ts`.
 *
 * Update anything here and it propagates everywhere — Footer, SiteHeader,
 * SiteBottomNav all consume from this file.
 */

import { PROFILE } from "./profile";

export const SITE_INFO = {
  name: PROFILE.displayName,
  /** Public deployed URL. Used as `metadataBase` for OpenGraph. */
  url: PROFILE.website,
  /**
   * Meta description surface (`<meta name="description">`, OG description,
   * RSS channel description). Sources from `PROFILE.description` — a short
   * one-liner — NOT `PROFILE.tagline` which is even shorter and used as
   * the tab-title suffix instead.
   */
  description: PROFILE.description,
  /** SEO keywords surface. Sources from `PROFILE.keywords` in
   *  `data/profile.json` so authors edit one place. */
  keywords: PROFILE.keywords as unknown as string[],
  /** OG image route — generated dynamically by `app/og/route.tsx`. */
  ogImage: "/og",
} as const;

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

/** GitHub repo that hosts THIS site's source code. */
export const SOURCE_CODE = {
  owner: PROFILE.githubUsername,
  name: "portfolio",
  get url() {
    return `https://github.com/${this.owner}/${this.name}`;
  },
} as const;

export const LICENSE = {
  name: "MIT License",
  get url() {
    return `${SOURCE_CODE.url}/blob/main/LICENSE`;
  },
} as const;

/**
 * Top-level nav. Consumed by `SiteHeader` (desktop links) AND
 * `SiteBottomNav` (mobile popover items). Add / reorder / rename here.
 */
export const MAIN_NAV: Array<{ title: string; href: string }> = [
  { title: "Blog", href: "/blog" },
];

/**
 * Footer metadata blocks — rendered as a definition list (`<dt>` term +
 * `<dd>` links) in `components/footer.tsx`. Mirrors chanhdai's footer
 * "Crafted by / Inspired by / Built with / Deployed on / Source / License"
 * layout. Drop, reorder, or add blocks freely; each is independent.
 */
export const FOOTER_META: Array<{
  term: string;
  links: Array<{ label: string; href?: string }>;
}> = [
  {
    term: "Crafted by",
    links: [{ label: PROFILE.displayName, href: PROFILE.website }],
  },
  {
    term: "Inspired by",
    links: [
      { label: "chanhdai.com", href: "https://chanhdai.com" },
      { label: "shadcn/ui", href: "https://ui.shadcn.com" },
    ],
  },
  {
    term: "Built with",
    links: [
      { label: "Next.js", href: "https://nextjs.org" },
      { label: "Tailwind CSS", href: "https://tailwindcss.com" },
      { label: "Motion", href: "https://motion.dev" },
      { label: "MDX", href: "https://mdxjs.com" },
    ],
  },
  {
    term: "Deployed on",
    links: [{ label: "Vercel", href: "https://vercel.com" }],
  },
  {
    term: "Source",
    links: [{ label: "GitHub", href: SOURCE_CODE.url }],
  },
  {
    term: "License",
    links: [{ label: LICENSE.name, href: LICENSE.url }],
  },
];
