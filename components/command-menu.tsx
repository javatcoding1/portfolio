"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommandState } from "cmdk";
import {
  BookOpenIcon,
  BoxIcon,
  BriefcaseBusinessIcon,
  CalendarCheckIcon,
  CornerDownLeftIcon,
  CrownIcon,
  GraduationCapIcon,
  HomeIcon,
  LayersIcon,
  MailIcon,
  MonitorIcon,
  MoonStarIcon,
  SunMediumIcon,
  TerminalIcon,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  GitHubIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/icons/brand-icons";
import { JMMark } from "@/components/layout/jm-mark";
import { PROFILE, SOCIAL_LINKS } from "@/config/profile";
import { useIsClient } from "@/hooks/use-is-client";

type CommandLinkItem = {
  title: string;
  href: string;
  /** Lucide icon OR an inline brand SVG component (same signature). */
  Icon:
    LucideIcon | ((props: React.ComponentProps<"svg">) => React.ReactElement);
  external?: boolean;
  keywords?: string[];
};

/**
 * The "kind" we tag every command item with (via its `value` prefix).
 * `CommandMenuFooter` reads cmdk's currently-highlighted value through
 * `useCommandState` and swaps the Enter label between "Go to page",
 * "Open link", and "Run command" so the bottom bar always tells the user
 * exactly what pressing Enter will do. Chanhdai's exact pattern.
 */
type CommandKind = "page" | "link" | "command";

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
  page: "Go to page",
  link: "Open link",
  command: "Run command",
};

const PAGE_ITEMS: CommandLinkItem[] = [
  { title: "Home", href: "/", Icon: HomeIcon },
  {
    title: "Blog",
    href: "/blog",
    Icon: BookOpenIcon,
    keywords: ["posts", "articles"],
  },
];

const BOOKING_ITEM: CommandLinkItem | null = PROFILE.bookingUrl
  ? {
      title: "Book a call",
      href: PROFILE.bookingUrl,
      Icon: CalendarCheckIcon,
      external: true,
      keywords: ["cal.com", "calendar", "meeting", "schedule"],
    }
  : null;

const SECTION_ITEMS: CommandLinkItem[] = [
  { title: "About", href: "/#about", Icon: BookOpenIcon },
  { title: "Stack", href: "/#stack", Icon: LayersIcon },
  { title: "Experience", href: "/#experience", Icon: BriefcaseBusinessIcon },
  { title: "Interactive Lab", href: "/#lab", Icon: TerminalIcon, keywords: ["ai", "h200", "qwen", "playwright", "webrtc", "simulation"] },
  { title: "Education", href: "/#education", Icon: GraduationCapIcon },
  { title: "Projects", href: "/#projects", Icon: BoxIcon },
  { title: "Awards", href: "/#awards", Icon: CrownIcon },
];

/**
 * Map the chip name in `SOCIAL_LINKS` to a Command-Menu icon. Keeps the
 * command palette decoupled from chip-icon detail (different rendering
 * context).
 */
const SOCIAL_ICON_BY_NAME: Record<string, CommandLinkItem["Icon"]> = {
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  "X / Twitter": XIcon,
  Email: MailIcon,
};

const SOCIAL_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map((link) => ({
  title: link.name,
  href: link.href,
  Icon: SOCIAL_ICON_BY_NAME[link.name] ?? MailIcon,
  external: link.href.startsWith("http"),
}));

/**
 * Command palette (cmd+k / ctrl+k / `/` to open). Mirrors chanhdai's
 * `CommandMenu` layout (Pages / Sections / Social Links / Theme) but with
 * just our data. Renders nothing while server-rendering — opens on
 * hotkey OR via the trigger button in the header.
 */
export function CommandMenu({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  useHotkeys(
    "mod+k, slash",
    (e) => {
      // Don't hijack `/` while user is typing in an input/textarea.
      const target = e.target as HTMLElement | null;
      if (
        e.key === "/" &&
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setOpen(!open);
    },
    { enabled: true, enableOnFormTags: false },
  );

  const handleSelect = useCallback(
    (item: CommandLinkItem) => {
      setOpen(false);
      if (item.external) {
        window.open(item.href, "_blank", "noopener");
      } else {
        router.push(item.href);
      }
    },
    [router, setOpen],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Menu"
      description="Search for a page, section, or social link."
    >
      <Command>
        <CommandInput placeholder="Type a command or search…" />

        {/* Nested-card pattern (chanhdai): the outer `<Command>` primitive
            provides `bg-popover p-1`, and this inner div punches through
            with `bg-background ring-1 ring-border` so the list groups sit
            in a visually distinct "elevated inset" card instead of
            floating in the same tint as the search input above and the
            footer below. `min-h-72` gives the card a stable height so the
            palette doesn't jump size when filtering to few results. */}
        <div className="mt-1 overflow-hidden rounded-lg bg-background ring-1 ring-border">
          <CommandList className="min-h-72">
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Pages">
              {PAGE_ITEMS.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`page ${item.title} ${item.keywords?.join(" ") ?? ""}`}
                  onSelect={() => handleSelect(item)}
                >
                  <item.Icon className="size-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
              {BOOKING_ITEM && (
                <CommandItem
                  key={BOOKING_ITEM.href}
                  value={`link ${BOOKING_ITEM.title} ${BOOKING_ITEM.keywords?.join(" ") ?? ""}`}
                  onSelect={() => handleSelect(BOOKING_ITEM)}
                >
                  <BOOKING_ITEM.Icon className="size-4" />
                  <span>{BOOKING_ITEM.title}</span>
                </CommandItem>
              )}
            </CommandGroup>

            <CommandGroup heading="Sections">
              {SECTION_ITEMS.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`page ${item.title}`}
                  onSelect={() => handleSelect(item)}
                >
                  <item.Icon className="size-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Social">
              {SOCIAL_ITEMS.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`link ${item.title}`}
                  onSelect={() => handleSelect(item)}
                >
                  <item.Icon className="size-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Theme">
              <CommandItem
                value="command theme light"
                onSelect={() => {
                  setTheme("light");
                  setOpen(false);
                }}
              >
                <SunMediumIcon className="size-4" />
                <span>Light</span>
              </CommandItem>
              <CommandItem
                value="command theme dark"
                onSelect={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
              >
                <MoonStarIcon className="size-4" />
                <span>Dark</span>
              </CommandItem>
              <CommandItem
                value="command theme system"
                onSelect={() => {
                  setTheme("system");
                  setOpen(false);
                }}
              >
                <MonitorIcon className="size-4" />
                <span>System</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>

        <CommandMenuFooter />
      </Command>
    </CommandDialog>
  );
}

/**
 * Context-aware footer bar sitting in the "gap" below the nested list
 * card. Left: the site brand mark (`<VGMark>`). Right: a label
 * that swaps between "Go to page ↵" / "Open link ↵" / "Run command ↵"
 * as the highlighted item changes, plus a `<Kbd>` with the Enter icon.
 *
 * How the kind is detected: every `CommandItem` above encodes its kind
 * as the first word of its `value` (`"page"` / `"link"` / `"command"`).
 * `useCommandState` subscribes to cmdk's internal store and returns the
 * currently-highlighted value — we read its first word, fall back to
 * `"page"` when nothing is highlighted (empty results, initial open).
 *
 * Hidden on `<sm` since the mobile pill trigger is what tap-users see;
 * the Enter shortcut isn't discoverable on a touch keyboard anyway.
 */
function CommandMenuFooter() {
  const value = useCommandState((state) => state.value);
  const firstToken = value?.split(" ")[0] ?? "page";
  const kind: CommandKind =
    firstToken === "link" || firstToken === "command" ? firstToken : "page";

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-2 px-3 pt-1 text-xs font-medium">
      <JMMark className="size-5 opacity-60" />
      <div className="flex items-center gap-2 max-sm:hidden">
        <span className="text-muted-foreground">
          {ENTER_ACTION_LABELS[kind]}
        </span>
        <Kbd>
          <CornerDownLeftIcon />
        </Kbd>
      </div>
    </div>
  );
}

/**
 * Search-style trigger button shown in the header. Click → opens the
 * command palette. Renders `⌘K` (or `Ctrl K`) shortcut hint via `Kbd`-styled
 * spans.
 */
export function CommandMenuTrigger() {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const isMac = isClient && /Mac|iPod|iPhone|iPad/i.test(navigator.platform);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        data-slot="command-menu-trigger"
        className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-background pr-1 pl-3 text-sm text-muted-foreground transition-colors hover:bg-accent-muted hover:text-foreground"
      >
        <SearchSvg className="size-3.5" />
        <span className="hidden sm:inline">Search…</span>
        <span className="flex items-center gap-0.5 rounded-full border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
          {isMac ? "⌘" : "Ctrl"} <span className="opacity-60">·</span> K
        </span>
      </button>

      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}

function SearchSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx={11} cy={11} r={8} />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
