# API Next JS Monorepo

This pnpm monorepo contains a Next.js IBE application plus an enterprise Prismic CMS setup.

## Structure

```txt
apps/
  ibe-app/        Existing IBE application
  web/            Public Next.js website consuming @repo/cms
  prismic-app/    Slice Machine and Prismic model management app

packages/
  cms/            Shared CMS package with Prismic client, services, labels, slices
  typescript-config/

scripts/
  generate-prismic-models.ts
  validate-labels.ts
  generate-figma-label-map.ts

prismic/
  figma-label-map.json
```

## Why `apps/prismic-app` Exists

`apps/prismic-app` is a developer-only app for Slice Machine. It owns Prismic model files and Slice Machine configuration. Developers run Slice Machine here, not from `apps/web`.

## Why Slices Live In `packages/cms`

Slices are shared CMS rendering units. Keeping them in `packages/cms/src/slices` lets:

- `apps/web` render slices from `@repo/cms`
- `apps/prismic-app` point Slice Machine at the same slice library
- CMS code stay outside website-specific app code

## Developer Workflow For A New Page

1. Add `packages/cms/src/features/contact/lang/en.json`
2. Add `packages/cms/src/features/contact/contact.schema.ts`
3. Add `packages/cms/src/features/contact/contact.service.ts`
4. Run `pnpm cms:generate`
5. Confirm the model appears under `apps/prismic-app/customtypes/contact_page/index.json`
6. Run `pnpm slicemachine`
7. Review and sync the model in Prismic
8. Add content in Prismic
9. Use `getContactPageContent` from `@repo/cms` in `apps/web`
10. Keep Figma layer names mapped to label keys

## Commands

```bash
pnpm dev:web
pnpm dev:prismic
pnpm slicemachine
pnpm cms:generate
pnpm cms:seed:dry
pnpm cms:seed
pnpm cms:validate
pnpm cms:check
```

## CMS Model Generation

Page-level JSON files live under:

```txt
packages/cms/src/features/*/lang/en.json
```

Shared labels live under:

```txt
packages/cms/src/shared/lang/en.json
```

Run:

```bash
pnpm cms:generate
```

This validates the JSON files and generates Prismic custom type/page model JSON under:

```txt
apps/prismic-app/customtypes/
```

## CMS Content Seeding

For large label sets, do not manually fill every field in Prismic. Seed the
initial content from the repo JSON files.

Dry run:

```bash
pnpm cms:seed:dry
```

Write to Prismic:

```bash
pnpm cms:seed
```

Required environment variables:

```env
PRISMIC_REPOSITORY_NAME=your-repository-name
PRISMIC_ACCESS_TOKEN=your-read-token
PRISMIC_WRITE_TOKEN=your-write-token
```

The seed script:

- reads page JSON files and shared labels
- validates them with Zod schemas
- converts nested keys to stable Prismic field IDs
- creates documents if they do not exist
- updates documents if they already exist
- converts text to the correct Prismic field shape

Use seeding for initial bulk content. Use the Prismic dashboard for normal
editorial changes after content is published.

## Slice Machine

Run:

```bash
pnpm slicemachine
```

Slice Machine is configured in:

```txt
apps/prismic-app/slicemachine.config.json
```

The slice library points to:

```txt
packages/cms/src/slices
```

## How `apps/web` Consumes CMS Content

`apps/web` must import CMS services from `@repo/cms`.

```tsx
import { getHomePageContent, HeroSection } from "@repo/cms";

export default async function HomePage({ params }) {
  const content = await getHomePageContent(params.locale);

  return <HeroSection labels={content.sections.hero} />;
}
```

Rules:

- `apps/web` must not directly create a Prismic client.
- UI components must not call Prismic.
- Server components should fetch CMS page content.
- Client components should receive CMS content as props.
- Redux must not be used for CMS page content.

## Figma Label Mapping

Figma mapping lives in:

```txt
prismic/figma-label-map.json
```

Generate mappings with:

```bash
tsx scripts/generate-figma-label-map.ts
```

The generator preserves manually edited mappings.

## Shared Labels

Shared/common labels live in:

```txt
packages/cms/src/shared/lang/en.json
```

They are generated into the `shared_labels` Prismic model and merged with page labels by `getPageLabels`.

## Local JSON Fallback

`packages/cms/src/prismic/label-resolver.ts` falls back to local JSON labels when Prismic is unavailable in development. This keeps the website running while CMS setup or content entry is still in progress.

## Adding Another Locale

Add locale JSON files beside `en.json`, for example:

```txt
packages/cms/src/features/home/lang/ja.json
packages/cms/src/shared/lang/ja.json
```

Then extend the CMS schema/service locale loading strategy and add the locale to `AppLocale`.

## CI Validation

Use:

```bash
pnpm cms:check
```

The validation checks:

- JSON schema validity
- Generated Prismic model files
- Missing fields
- Duplicate field IDs
- Figma mapping consistency

## Do Not

- Do not put all labels in one huge Prismic document.
- Do not put slices directly inside `apps/web`.
- Do not put Prismic client code inside `apps/web` components.
- Do not use Redux for CMS labels/content.
- Do not make every page a Client Component.
- Do not hardcode CMS text inside React components.
- Do not generate unstable or random Prismic field IDs.
- Do not break existing Prismic field IDs when labels are renamed.
