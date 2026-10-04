"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Stats = {
  configured: boolean
  region: string | null
  periodDays?: number
  pageviews: number | null
  visitors: number | null
  today?: number | null
  week?: number | null
  trend?: Array<{ date: string; pageviews: number; visitors: number }>
  blogViews?: Array<{
    slug: string
    title: string
    publishedAt: string
    views: number | null
  }>
}

const number = new Intl.NumberFormat("en")
const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/stats", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Stats unavailable")
        return response.json()
      })
      .then(setStats)
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true)
      })

    return () => controller.abort()
  }, [])

  if (failed) {
    return (
      <p className="screen-line-bottom px-4 py-10 text-sm text-muted-foreground">
        Traffic report unavailable. Try again later.
      </p>
    )
  }

  if (!stats) return <StatsLoading />

  if (!stats.configured) {
    return (
      <div className="screen-line-bottom px-4 py-10">
        <p className="font-medium">Analytics API not configured.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Local timings still work. Public traffic appears after deployment.
        </p>
      </div>
    )
  }

  return (
    <div className="screen-line-bottom animate-in fade-in-0 duration-500 motion-reduce:animate-none">
      <div className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        <Metric label="Page views" value={stats.pageviews} />
        <Metric label="Visitors" value={stats.visitors} />
        <Metric label="Today" value={stats.today} />
        <Metric label="Last 7 days" value={stats.week} />
      </div>

      <section className="border-b border-line px-4 py-6">
        <header className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-medium">Request pulse</p>
            <p className="text-sm text-muted-foreground">
              Daily traffic, updated hourly
            </p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-muted-foreground sm:justify-end">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-info" />
              Views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-muted-foreground"
              />
              Visitors
            </span>
          </div>
        </header>
        <TrafficTrace points={stats.trend ?? []} />
        <p className="mt-3 text-right font-mono text-[10px] text-muted-foreground">
          {stats.region ?? "Vercel edge"}
        </p>
      </section>

      <section>
        <header className="flex items-center justify-between border-b border-line px-4 py-4">
          <div>
            <h2 className="font-medium">Blog readership</h2>
            <p className="text-sm text-muted-foreground">Exact post routes</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">30d</span>
        </header>

        <div>
          {(stats.blogViews ?? []).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-accent-muted"
            >
              <div className="min-w-0">
                <p className="font-medium leading-snug text-pretty group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </p>
                <time
                  className="mt-1 block font-mono text-xs text-muted-foreground"
                  dateTime={post.publishedAt}
                >
                  {date.format(new Date(post.publishedAt))}
                </time>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg tabular-nums">
                  {post.views == null ? "—" : number.format(post.views)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">views</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  return (
    <div className="min-w-0 border-r border-b border-line px-4 py-5 even:border-r-0 nth-[n+3]:border-b-0 sm:even:border-r sm:border-b-0 sm:last:border-r-0">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl tabular-nums sm:text-3xl">
        {value == null ? "—" : number.format(value)}
      </p>
    </div>
  )
}

function TrafficTrace({
  points,
}: {
  points: Array<{ date: string; pageviews: number; visitors: number }>
}) {
  if (!points.length) {
    return <p className="py-12 text-sm text-muted-foreground">No traffic yet.</p>
  }

  return (
    <div
      className="h-56 min-w-0 w-full sm:h-64"
      role="img"
      aria-label="Page views and visitors during the last 30 days"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1}
        minHeight={224}
        initialDimension={{ width: 720, height: 224 }}
      >
        <LineChart
          className="focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
          data={points}
          margin={{ top: 12, right: 8, bottom: 0, left: 8 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--line)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={36}
            tickFormatter={(value) => date.format(new Date(value))}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <YAxis hide domain={[0, "dataMax"]} padding={{ top: 12 }} />
          <Tooltip
            cursor={{ stroke: "var(--line)", strokeDasharray: "3 5" }}
            labelFormatter={(value) => date.format(new Date(String(value)))}
            formatter={(value) => number.format(Number(value))}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--line)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
            labelStyle={{ color: "var(--foreground)", marginBottom: 6 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            animationDuration={700}
          />
          <Line
            type="monotone"
            dataKey="pageviews"
            name="Views"
            stroke="var(--info)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            animationDuration={700}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="screen-line-bottom animate-pulse motion-reduce:animate-none">
      <div className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="border-r border-line px-4 py-5">
            <div className="h-2 w-16 rounded bg-muted" />
            <div className="mt-3 h-8 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="border-b border-line px-4 py-6">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-2 h-3 w-40 rounded bg-muted/70" />
        <div className="mt-6 h-56 rounded bg-muted/50 sm:h-64" />
      </div>
      <div className="border-b border-line px-4 py-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-2 h-3 w-24 rounded bg-muted/70" />
      </div>
      <div>
        {[0, 1].map((item) => (
          <div
            key={item}
            className="grid grid-cols-[1fr_auto] gap-4 border-b border-line px-4 py-4 last:border-b-0"
          >
            <div>
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-3 w-12 rounded bg-muted/70" />
            </div>
            <div className="h-6 w-14 rounded bg-muted" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading traffic report…</span>
    </div>
  )
}
