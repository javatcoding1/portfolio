import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DocContainer,
  DocContentCol,
  DocGrid,
  DocLeftCol,
  DocRightCol,
} from "@/components/doc/doc-layout"
import { FOOTER_META } from "@/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Credits",
  description:
    "Credits, dependencies, and attribution for this portfolio site.",
  alternates: { canonical: "/credits" },
}

/**
 * `/credits` — shares the exact blog-post shell (back-link strip →
 * title → 3-col grid → prose article) so the page reads as part of the
 * same document family instead of a bespoke one-off.
 *
 * Content is the definition list that used to sit in the footer
 * ("Crafted by / Inspired by / Built with / Deployed on / Source /
 * License") but styled as a `<dl>` inside `.prose` so it inherits the
 * blog prose spacing.
 */
export default function CreditsPage() {
  return (
    <>
      <DocContainer>
        <div className="screen-line-bottom h-px" />

        <div className="flex items-center justify-between p-2 pl-4">
          <Button
            className="h-7 gap-2 border-none px-0 tracking-wider text-muted-foreground hover:text-foreground hover:no-underline"
            variant="link"
            size="sm"
            asChild
          >
            <Link href="/">
              <ArrowLeftIcon />
              Home
            </Link>
          </Button>
        </div>

        <div className="screen-line-top screen-line-bottom py-px">
          <div className="h-4" />
        </div>

        <h1
          data-slot="doc-title"
          className="screen-line-bottom px-4 text-4xl font-medium tracking-tight text-balance"
        >
          Credits
        </h1>
      </DocContainer>

      <DocGrid>
        <DocLeftCol />

        <DocContentCol className="screen-line-bottom">
          <article className="prose prose-zinc prose-ncdai dark:prose-invert max-w-none px-4 pt-8 pb-8">
            <p className="text-muted-foreground">
              People, tools, and services that made this site possible.
            </p>

            <dl className="not-prose mt-8 flex flex-col gap-4 font-mono [&_dd]:text-sm [&_dt]:text-right [&_dt]:text-sm [&_dt]:text-muted-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
              {FOOTER_META.map((block) => (
                <Item key={block.term}>
                  <dt>{block.term}</dt>
                  <dd>
                    {block.links.length === 1 ? (
                      <CreditLink link={block.links[0]!} />
                    ) : (
                      <ul>
                        {block.links.map((link) => (
                          <li key={link.label}>
                            <CreditLink link={link} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </Item>
              ))}
            </dl>
          </article>
        </DocContentCol>

        <DocRightCol />
      </DocGrid>
    </>
  )
}

function Item({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid grid-cols-2 gap-4", className)} {...props} />
}

function CreditLink({
  link,
}: {
  link: { label: string; href?: string }
}) {
  if (!link.href) return <span>{link.label}</span>
  const external = link.href.startsWith("http")
  return (
    <Link
      className="link-underline"
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
    >
      {link.label}
    </Link>
  )
}
