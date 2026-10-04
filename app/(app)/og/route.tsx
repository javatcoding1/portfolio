import { ImageResponse } from 'next/og'
import { PROFILE } from '@/config/profile'

/**
 * Generated cover image used as the blog-card fallback when a post has no
 * `image:` frontmatter, AND as the OpenGraph image for social-card unfurls.
 *
 * Renders a dark, 1200×630 panel with the post title in a serif-ish bold —
 * the grayscale filter on `PostItem` is intentionally OK with this since
 * the panel reads cleanly in monochrome.
 */
export function GET(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || `${PROFILE.displayName}'s Portfolio`
  const description = url.searchParams.get('description') || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '72px',
          background:
            'radial-gradient(circle at 20% 20%, #1a1a1a 0%, #0a0a0a 60%)',
          color: '#fafafa',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Diagonal stripes corner accent (purely decorative — gives the
            generated cards a recognizable "brand" mark). */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '240px',
            height: '240px',
            background:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)',
          }}
        />

        {/* Tagline / kicker */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(250, 250, 250, 0.55)',
            marginBottom: 16,
          }}
        >
          {`Portfolio · ${PROFILE.displayName}`}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              lineHeight: 1.4,
              color: 'rgba(250, 250, 250, 0.65)',
              marginTop: 24,
              maxWidth: '900px',
            }}
          >
            {description}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
