import type { Metadata } from "next"

import { DocContainer } from "@/components/doc/doc-layout"
import {
  PageHeading,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { StatsDashboard } from "@/components/stats-dashboard"

export const metadata: Metadata = {
  title: "Stats",
  description: "Thirty days of portfolio traffic and blog readership.",
}

export default function StatsPage() {
  return (
    <>
      <div
        className="mx-auto h-12 border-x border-line md:max-w-3xl"
        aria-hidden
      />

      <DocContainer>
        <PageHeading>
          <PageHeadingTagline>Telemetry / 30 days</PageHeadingTagline>
          <PageHeadingTitle>What gets read.</PageHeadingTitle>
        </PageHeading>

        <StatsDashboard />
      </DocContainer>
    </>
  )
}
