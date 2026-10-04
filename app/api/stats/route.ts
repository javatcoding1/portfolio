import { NextResponse } from "next/server"

import { listBlogPosts } from "@/app/(app)/blog/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TrendPoint = {
  timestamp: string
  visitors: number
  pageviews: number
}

type PathPoint = {
  requestPath: string
  visitors: number
  pageviews: number
}

type AggregateResponse<T> = { data?: T[] }

const CACHE = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
const NO_CACHE = "no-store, max-age=0"

function metric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0
}

async function query<T>(
  path: string,
  params: URLSearchParams,
  token: string
): Promise<T | null> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/query/web-analytics/${path}?${params}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      }
    )

    return response.ok ? ((await response.json()) as T) : null
  } catch {
    return null
  }
}

export async function GET() {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const region = process.env.VERCEL_REGION ?? null
  const posts = listBlogPosts().map(({ slug, metadata }) => ({
    slug,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
  }))

  if (!token || !projectId) {
    return NextResponse.json(
      {
        configured: false,
        region,
        periodDays: 30,
        pageviews: null,
        visitors: null,
        today: null,
        week: null,
        trend: [],
        blogViews: posts.map((post) => ({ ...post, views: null })),
      },
      { headers: { "Cache-Control": NO_CACHE } }
    )
  }

  const until = new Date()
  const since = new Date(until)
  since.setUTCDate(since.getUTCDate() - 29)
  since.setUTCHours(0, 0, 0, 0)

  const common = new URLSearchParams({
    projectId,
    since: since.toISOString(),
    until: until.toISOString(),
  })
  const trendParams = new URLSearchParams(common)
  trendParams.set("by", "day")
  trendParams.set("limit", "31")
  const blogParams = new URLSearchParams(common)
  blogParams.set("by", "requestPath")
  blogParams.set("filter", "startswith(requestPath, '/blog/')")
  blogParams.set("limit", "100")

  const [trendResponse, blogResponse] = await Promise.all([
    query<AggregateResponse<TrendPoint>>("visits/aggregate", trendParams, token),
    query<AggregateResponse<PathPoint>>("visits/aggregate", blogParams, token),
  ])

  const trend = (trendResponse?.data ?? []).map((point) => ({
    date: point.timestamp,
    visitors: metric(point.visitors),
    pageviews: metric(point.pageviews),
  }))
  const pathViews = new Map(
    (blogResponse?.data ?? []).map((point) => [
      point.requestPath,
      metric(point.pageviews),
    ])
  )

  return NextResponse.json(
    {
      configured: true,
      region,
      periodDays: 30,
      pageviews: trend.reduce((total, point) => total + point.pageviews, 0),
      visitors: trend.reduce((total, point) => total + point.visitors, 0),
      today: trend.at(-1)?.pageviews ?? 0,
      week: trend.slice(-7).reduce((total, point) => total + point.pageviews, 0),
      trend,
      blogViews: posts.map((post) => ({
        ...post,
        views: blogResponse ? (pathViews.get(`/blog/${post.slug}`) ?? 0) : null,
      })),
    },
    { headers: { "Cache-Control": CACHE } }
  )
}
