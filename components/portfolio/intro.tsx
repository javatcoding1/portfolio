import ReactMarkdown from "react-markdown"

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel"
import { getTimeOfDayGreeting } from "@/lib/greeting"
import { cn } from "@/lib/utils"
import { PROFILE } from "@/config/profile"

/**
 * "Good {time-of-day}" intro panel. Uses the SAME panel-title styling as
 * Stack / Experience / Education — the greeting is a section header, not a
 * giant hero. Bio paragraphs (containing the name, role, and any markdown
 * links) live in the panel body underneath.
 *
 * The greeting is computed against `PROFILE.timeZone`, so visitors from
 * anywhere see your local time-of-day, not theirs.
 */
export function Intro() {
  const greeting = getTimeOfDayGreeting(new Date(), PROFILE.timeZone)

  return (
    <Panel id="about">
      <PanelHeader>
        <PanelTitle>
          <a href="#about">Good {greeting}</a>
        </PanelTitle>
      </PanelHeader>

      <PanelContent>
        <div
          className={cn(
            "prose max-w-none dark:prose-invert",
            // Tighten typography for this small intro block so paragraphs
            // don't look like a long-form article.
            "prose-sm prose-p:my-3 prose-p:leading-relaxed",
            "prose-a:font-normal prose-a:underline prose-a:decoration-current/30 prose-a:underline-offset-3 hover:prose-a:decoration-current"
          )}
        >
          <ReactMarkdown>{PROFILE.about}</ReactMarkdown>
        </div>
      </PanelContent>
    </Panel>
  )
}
