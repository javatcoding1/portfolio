import { Panel, PanelContent } from "@/components/panel"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SOCIAL_LINKS } from "@/config/profile"

/**
 * Compact social-icons row — BARE Panel (no opt-outs). Sits between
 * `<Overview>` (which opts out of `screen-line-bottom`) and
 * `<GitHubContributionsPanel>` (which opts out of `screen-line-top`), so
 * this panel's own top + bottom lines paint the shared seams on both
 * sides. This is chanhdai's exact intro-group chain.
 */
export function SocialLinks() {
  return (
    <Panel>
      <h2 className="sr-only">Social Links</h2>

      <PanelContent>
        <ul className="flex flex-wrap gap-2">
          {SOCIAL_LINKS.map(({ name, href, Icon }) => (
            <li key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener" : undefined}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground/80 transition-colors hover:bg-accent-muted hover:text-foreground"
                  >
                    <Icon className="size-4.5" aria-hidden />
                    <span className="sr-only">{name}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </PanelContent>
    </Panel>
  )
}
