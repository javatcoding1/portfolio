This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Comments and monitoring

Visitor analytics and Core Web Vitals use Vercel Analytics and Speed Insights.
Server traces use OpenTelemetry through `instrumentation.ts`; set the standard
`OTEL_EXPORTER_OTLP_*` variables from `.env.example` when using an external
collector.

- **Visitors and referrers:** Vercel project → Analytics.
- **Latency and Core Web Vitals:** Vercel project → Speed Insights.
- **Server traces:** the OTLP backend configured by `OTEL_EXPORTER_OTLP_*`.
- **Public visitor count:** set `VERCEL_TOKEN`; project/team IDs are
  documented in `.env.example`. The footer panel still shows local timings
  without it.

Blog comments use GitHub Discussions through Giscus:

1. Enable Discussions for `wizaye/portfolio-updated`.
2. Install the [Giscus GitHub App](https://github.com/apps/giscus) for the repo.
3. Create a `Blog comments` discussion category.
4. Use [giscus.app](https://giscus.app) to copy the category and category ID
   into a local `.env` or the deployment environment.

## Garden pet

The garden accepts the standard Codex Pets 1536×1872 spritesheet format. Set
`NEXT_PUBLIC_PET_SPRITESHEET_URL` to any public Codex Pets WebP or PNG URL and
restart the app; the default is Noir Webling. No package or icon library is
required.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
