import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from 'next-themes'

import { ResponsiveToaster } from '@/components/responsive-toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CustomCursor } from '@/components/effects/custom-cursor'
import { PROFILE } from '@/config/profile'
import { SITE_INFO } from '@/config/site'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  alternates: {
    canonical: '/',
  },
  title: {
    default: `${PROFILE.displayName} - ${PROFILE.tagline}`,
    template: `%s - ${PROFILE.displayName}`,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  authors: [{ name: PROFILE.displayName, url: SITE_INFO.url }],
  creator: PROFILE.displayName,
  openGraph: {
    title: PROFILE.displayName,
    description: SITE_INFO.description,
    url: SITE_INFO.url,
    siteName: SITE_INFO.name,
    locale: 'en_US',
    type: 'profile',
    firstName: PROFILE.firstName,
    lastName: PROFILE.lastName,
    username: PROFILE.username,
    gender: PROFILE.gender,
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_INFO.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PROFILE.displayName,
    description: SITE_INFO.description,
    creator: `@${PROFILE.twitterUsername}`,
    images: [SITE_INFO.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Root layout — chanhdai-pattern split. Intentionally LEAN: only the
 * document scaffold (`<html>`, `<body>`), font CSS variables, theme +
 * tooltip providers, analytics, and the global toaster live here. The
 * actual user-facing SHELL (header, main, footer, mobile pill) is in
 * `app/(app)/layout.tsx` so route groups can opt into a different shell
 * without forking the root.
 *
 * Geist Sans + Geist Mono are loaded ONCE via the official `geist`
 * package (variables: `--font-geist-sans`, `--font-geist-mono`). Those
 * are aliased to `--font-sans` / `--font-mono` in `globals.css` `@theme
 * inline` so every `font-sans` / `font-mono` / `font-heading` utility
 * resolves to Geist consistently across the site.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      <head>
        {/* Pre-hydration script — chanhdai's anti-flash technique. Reads
            the persisted `avatarLights` value from localStorage and
            writes `data-avatar-lights="on|off"` on <html> BEFORE first
            paint, so the avatar's CSS-filter state is correct on the
            very first frame (no flash from default "on" to "off" if the
            user had toggled it off). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var v=localStorage.getItem('avatarLights');document.documentElement.dataset.avatarLights=JSON.parse(v||'"on"');}catch(_){document.documentElement.dataset.avatarLights='on';}`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          <TooltipProvider>
            <CustomCursor />
            {children}
            <Analytics />
            <SpeedInsights />
            <ResponsiveToaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
