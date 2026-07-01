# API Next JS Monorepo

This pnpm monorepo contains the IBE application plus a Prismic-backed website
setup.

## Structure

```txt
apps/
  ibe-app/        IBE application
  web/            Public Next.js website and page content owner
  prismic-app/    Prismic CLI, custom types, and Prismic migration owner

packages/
  cms/            Shared Prismic slice rendering components only
  typescript-config/
```

## Ownership

`apps/web` owns website content definitions:

```txt
apps/web/src/content/home/lang/en.json
apps/web/src/content/about/lang/en.json
apps/web/src/content/shared/lang/en.json
```

Most developers add or update local content JSON, schemas, and page services in
`apps/web`.

`apps/prismic-app` owns Prismic modeling and setup:

```txt
apps/prismic-app/customtypes/
apps/prismic-app/prismic.config.json
apps/prismic-app/scripts/
apps/prismic-app/src/prismic/
```

The CMS owner uses Prismic Type Builder in the web UI, then uses this
workspace to generate types, validate models, and seed or configure Prismic
content.

`packages/cms` owns only reusable slice components:

```txt
packages/cms/src/slices
```

It should not contain page copy, Prismic clients, page services, or model
generation logic.

## Commands

```bash
pnpm dev:web
pnpm prismic:types:generate
pnpm prismic:models:generate
pnpm prismic:seed:dry
pnpm prismic:seed
pnpm prismic:validate
pnpm prismic:check
```

## New Page Flow

1. Add the page JSON under `apps/web/src/content/{page}/lang/en.json`.
2. Add the Zod schema under `apps/web/src/content/{page}/{page}.schema.ts`.
3. Add the page service under `apps/web/src/content/{page}/{page}.service.ts`.
4. Add or update the Next.js route in `apps/web/src/app`.
5. Run `pnpm prismic:models:generate`.
6. Confirm the model appears under `apps/prismic-app/customtypes`.
7. The Prismic owner reviews the model and manages it in Prismic Type Builder.
8. Seed initial content with `pnpm prismic:seed` or configure it in Prismic.

## How Web Reads Content

Server components in `apps/web` call local content services. Those services try
Prismic first and fall back to local JSON during development.

```tsx
import { getHomePageContent } from "@/content/home/home.service";
import { HeroSection } from "@repo/cms";

export default async function HomePage({ params }) {
  const content = await getHomePageContent(params.locale);

  return <HeroSection labels={content.sections.hero} />;
}
```

Rules:

- UI components must not call Prismic.
- Server components should fetch CMS page content.
- Client components should receive CMS content as props.
- Redux must not be used for CMS page content.
- `@repo/cms` is for slices only.

## Content Seeding

For large label sets, do not manually fill every field in Prismic. Seed initial
content from the repo JSON files.

Dry run:

```bash
pnpm prismic:seed:dry
```

Write to Prismic:

```bash
pnpm prismic:seed
```

Required environment variables:

```env
PRISMIC_REPOSITORY_NAME=your-repository-name
PRISMIC_ACCESS_TOKEN=your-read-token
PRISMIC_WRITE_TOKEN=your-write-token
```

Keep real tokens in `.env.local`. That file is ignored by Git.
