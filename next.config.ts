import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "helixque.vercel.app",
      },
    ],
    // Next.js 16 requires every `<Image quality={n}>` value used in the app
    // to be listed here. Default is `[75]`; we render company / project
    // logos with `quality={100}` (crisp brand marks are worth the extra
    // ~10-20% payload on tiny SVG-avatar PNGs), so allow both.
    qualities: [75, 100],
  },

  experimental: {
    /**
     * Turbopack per-file-import optimization for barrel-heavy libs.
     *
     * A single `import { X } from 'lucide-react'` normally pulls the
     * entire ~1200-icon barrel into the module graph before Turbopack
     * tree-shakes; `optimizePackageImports` rewrites those imports at
     * build time into direct-file references so only the icons you
     * actually use hit the compiler. Matters most on cold-start dev
     * compile (used to be 7-11s for `/blog/[slug]`, dominated by
     * lucide + motion + mermaid + date-fns module resolution).
     *
     * Listed packages: everything on our home + blog pages that ships
     * with a barrel `index` and >50 exported members. Safe to keep
     * adding to — no runtime cost, no behavior change.
     */
    optimizePackageImports: [
      "lucide-react",
      "@icons-pack/react-simple-icons",
      "date-fns",
      "motion",
      "radix-ui",
      "cmdk",
      "sonner",
      "react-markdown",
    ],
  },
};

export default nextConfig;
