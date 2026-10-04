# `data/`

**Single source of truth for all portfolio content.** Every JSON file
in this folder maps 1:1 to a typed constant re-exported from
`config/profile.ts`. To update your portfolio, edit these JSONs — do
NOT edit `config/profile.ts` (that file is a thin hydration wrapper
around the JSONs, plus icon-component rehydration for `SOCIAL_LINKS`).

## Files

| File | Powers | Notes |
|---|---|---|
| [`profile.json`](./profile.json) | `PROFILE` — identity, tagline, contact | Includes `{githubUsername}` / `{email}` placeholders that `social-links.json` interpolates. |
| [`social-links.json`](./social-links.json) | `SOCIAL_LINKS` | Uses `iconKey` (`github` / `linkedin` / `x` / `mail`); `config/profile.ts` maps each key to a real icon component. |
| [`stack.json`](./stack.json) | `TECH_STACK` (flat pills) + `STACK` (categorized) | `iconKey` values must match a registered brand icon in [`components/portfolio/stack-icons.tsx`](../components/portfolio/stack-icons.tsx). Omit `iconKey` to render a plain chip (trademarked brands with no icon in `@icons-pack/react-simple-icons`). |
| [`experiences.json`](./experiences.json) | `EXPERIENCES` | `employmentPeriod.start` uses `"MM.YYYY"` or `"YYYY"`. Omit `end` to mean "Present". |
| [`education.json`](./education.json) | `EDUCATION` | Same period format as experiences. |
| [`projects.json`](./projects.json) | `PROJECTS` | `skills` is a plain string array; each renders as a mono chip. |
| [`awards.json`](./awards.json) | `AWARDS` | `date` uses `"YYYY-MM"`. |

## Why JSON?

- **CMS-ready.** A headless CMS (Sanity, Payload, Contentlayer, or a
  simple Git-based CMS) can own this folder without touching any TS
  or React code. Same for a build-time content pipeline.
- **No React imports.** JSON cannot embed React components, so all
  icons are looked up by string key at runtime in `config/profile.ts`.
  That keeps the data files pure and portable.
- **Diff-friendly.** Editing content produces small, readable diffs —
  no `as const` blast radius or TS churn on data-only changes.

## The hydration wrapper

[`config/profile.ts`](../config/profile.ts) does three things:

1. Imports each JSON file directly (`import x from "@/data/x.json"`).
2. Maps `iconKey` strings on `SOCIAL_LINKS` to real icon components
   via a small registry (`ICON_REGISTRY`).
3. Interpolates `{githubUsername}` / `{email}` placeholders in
   `social-links.json` `href` values using the loaded profile.
4. Casts the results to the typed shapes that the rest of the app
   expects (`Experience[]`, `EducationEntry[]`, `Project[]`, etc.)
   and re-exports them under the same names as before.

If you need to add a new social icon, edit `ICON_REGISTRY` and add
the new `iconKey` value to `social-links.json`. If you need a new
stack icon, add it to `STACK_ICON_REGISTRY` in
[`components/portfolio/stack-icons.tsx`](../components/portfolio/stack-icons.tsx)
and reference its key in `stack.json`.
