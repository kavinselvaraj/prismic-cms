# Prismic Architecture Setup for IBE App Monorepo

This document defines the recommended enterprise Prismic architecture for the
monorepo below:

```txt
apps/
  ibe-app/
  prismic-app/

packages/
  cms/
```

It is designed for:

- **Phase 1**: label-based Prismic integration
- **Phase 2**: full page content and slice-driven Prismic integration

The goal is to keep Prismic ownership clean, avoid duplicated client logic, and
make `ibe-app` consume Prismic in a predictable, enterprise-safe way.

---

## 1. Purpose of This Architecture

This architecture exists to solve these problems:

- keep all Prismic authoring and model ownership in one place
- avoid direct Prismic logic spread across the main app
- allow `ibe-app` teams to consume content without knowing Prismic internals
- centralize shared typed fetching logic in `packages/cms`
- support gradual evolution from labels to full slice/page content
- keep generated Prismic types controlled and reproducible

This is especially important in a monorepo where multiple teams may work on:

- UI development
- Prismic modeling
- localization
- shared CMS rendering

---

## 2. Final Folder Structure

Recommended final structure:

```txt
apps/
  ibe-app/
    src/
      app/
      components/
      features/
      i18n/
      pages/                 # optional, depending on routing style
    package.json

  prismic-app/
    customtypes/
    src/
      app/
      prismicio.ts          # thin adapter if Prismic tooling expects it
      prismic/
        write-client.ts     # write-side client for migrations/content updates
    slices/                 # optional only if tooling needs local Slice Machine references
    prismicio-types.d.ts    # canonical generated Prismic types
    prismicCodegen.config.ts
    slicemachine.config.json
    package.json

packages/
  cms/
    src/
      generated/
        prismicio-types.d.ts   # synced copy from prismic-app
      prismicio.ts             # shared read-side client
      prismic/
        config.ts
        create-client.ts
        repository.ts
        preview.ts             # optional
      services/
        label-service.ts
        page-service.ts        # phase 2
      helpers/
        label-resolver.ts
        mappers.ts             # optional phase 2
      slices/
        HeroBanner/
        RichTextSection/
        ...
      types/
      index.ts
    package.json
```

---

## 3. Responsibility of Each App/Package

### `apps/ibe-app`

This is the main Next.js application.

Responsibilities:

- render pages and UI
- call shared content services from `packages/cms`
- consume normalized labels/content
- keep app/business logic separate from Prismic internals

Must not own:

- Prismic model generation
- Prismic custom type JSON
- duplicated Prismic client setup
- direct document querying logic spread across pages/components

### `apps/prismic-app`

This is the Prismic owner application.

Responsibilities:

- Slice Machine
- custom types
- Prismic model/codegen config
- canonical generated Prismic types
- write-side Prismic operations
- custom type sync and content migration tooling

Must not become:

- the main runtime content consumer
- the place where reusable business fetching logic lives

### `packages/cms`

This is the shared CMS package consumed by `ibe-app`.

Responsibilities:

- shared read-side Prismic client
- synced generated Prismic types
- label/content services
- helpers and resolvers
- slice rendering components
- typed utilities for content consumption

This package is the contract between:

- Prismic owner team
- application teams consuming content

---

## 4. How Prismic Slice Machine Should Live Inside `prismic-app`

Slice Machine should be owned by `apps/prismic-app`.

Recommended:

- `slicemachine.config.json` lives in `apps/prismic-app`
- Slice Machine is started from `apps/prismic-app`
- custom types are stored under `apps/prismic-app/customtypes`
- Prismic canonical type generation is triggered from `apps/prismic-app`

This keeps Prismic authoring isolated from the main business application.

### Why

If Slice Machine is mixed into `ibe-app`, over time teams will:

- create direct Prismic coupling in the main app
- mix authoring concerns with runtime concerns
- duplicate config and lose ownership clarity

The clean split is:

- `prismic-app` = authoring/model ownership
- `ibe-app` = consumption

---

## 5. How `prismicio.ts` Should Be Handled

Recommended approach:

- the real reusable read-side implementation lives in `packages/cms`
- `apps/prismic-app/src/prismicio.ts` can remain as a thin adapter if required by Prismic tooling

### Recommended pattern

#### Shared implementation

- `packages/cms/src/prismicio.ts`

This should export:

- read-side Prismic client factory
- repository/config helpers
- preview helpers if needed

#### Thin adapter in `prismic-app`

- `apps/prismic-app/src/prismicio.ts`

This should only import and re-export the shared client if Slice Machine or
Prismic setup expects an app-local `prismicio.ts`.

### Why

This avoids:

- duplicate client creation
- drift between apps
- app-specific differences in repository config

---

## 6. How `prismicio-types.d.ts` Should Be Generated

Recommended model:

- **canonical generated file**
  - `apps/prismic-app/prismicio-types.d.ts`
- **synced shared copy**
  - `packages/cms/src/generated/prismicio-types.d.ts`

### Why this is recommended

`prismic-app` owns:

- Slice Machine
- custom type definitions
- codegen configuration

So it should also own the canonical generated output.

`packages/cms` needs a copy because:

- shared services need typed document access
- `ibe-app` consumes `packages/cms`, not `prismic-app`

This preserves ownership while keeping shared consumption practical.

---

## 7. How to Keep Generated Prismic Types Synced

Keep one canonical generated source and copy/sync it into `packages/cms`.

### Canonical file

```txt
apps/prismic-app/prismicio-types.d.ts
```

### Synced file

```txt
packages/cms/src/generated/prismicio-types.d.ts
```

### Recommended sync flow

1. Run codegen in `prismic-app`
2. Copy generated file into `packages/cms`
3. Export it from `packages/cms`

### Suggested sync script idea

```bash
pnpm prismic:types:generate
```

This command should:

1. generate `apps/prismic-app/prismicio-types.d.ts`
2. copy/sync to `packages/cms/src/generated/prismicio-types.d.ts`

### Why not keep two independent generated files

Because that creates:

- drift risk
- confusion about which one is canonical
- duplicated generation ownership

---

## 8. Recommended `prismic.codegen` Setup

Use both:

- **Slice Machine**
- **`prismic-ts-codegen`**

### Why use both

#### Slice Machine

Good for:

- authoring custom types
- Prismic workflow integration
- visual modeling

#### `prismic-ts-codegen`

Good for:

- deterministic type generation
- CI-friendly typed output
- shared type consumption in `packages/cms`

### Recommended `prismicCodegen.config.ts`

Example:

```ts
import type { Config } from "prismic-ts-codegen";

const config: Config = {
  output: "./prismicio-types.d.ts",
  models: [
    "./customtypes/**/index.json",
    "../../packages/cms/src/slices/**/model.json",
  ],
};

export default config;
```

### Notes

- output is canonical in `apps/prismic-app`
- slice models are read from `packages/cms/src/slices`
- synced copy should then be written to `packages/cms/src/generated`

---

## 9. Recommended Package Scripts

### Root `package.json`

Recommended scripts:

```json
{
  "scripts": {
    "dev:ibe": "pnpm --filter ibe-app dev",
    "prismic:models:generate": "pnpm --filter prismic-app prismic:models:generate",
    "prismic:validate": "pnpm --filter prismic-app prismic:validate",
    "prismic:types:generate": "pnpm --filter prismic-app prismic:types:generate",
    "prismic:seed:dry": "pnpm --filter prismic-app prismic:seed:dry",
    "prismic:seed": "pnpm --filter prismic-app prismic:seed"
  }
}
```

### `apps/prismic-app/package.json`

Recommended scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "slicemachine": "start-slicemachine",
    "prismic:models:generate": "tsx scripts/generate-prismic-models.ts",
    "prismic:validate": "tsx scripts/validate-labels.ts",
    "prismic:types:generate": "prismic-ts-codegen && tsx scripts/sync-prismic-types.ts",
    "prismic:seed:dry": "tsx scripts/seed-prismic-content.ts",
    "prismic:seed": "tsx scripts/seed-prismic-content.ts --write"
  }
}
```

### Optional sync script

Recommended:

```txt
apps/prismic-app/scripts/sync-prismic-types.ts
```

Its responsibility:

- copy `apps/prismic-app/prismicio-types.d.ts`
- into `packages/cms/src/generated/prismicio-types.d.ts`

---

## 10. How `packages/cms` Should Expose Shared Capabilities

`packages/cms` should be the only shared read-side CMS contract used by
`ibe-app`.

It should expose:

- Prismic client
- generated types
- label/content services
- helper utilities
- slice components

### Recommended exports

From `packages/cms/src/index.ts` export:

- `prismicio`
- `services`
- `helpers`
- `generated/prismicio-types`
- `slices`

### Recommended service layers

#### Phase 1

- `label-service.ts`
- label resolver/helper

#### Phase 2

- page content services
- slice resolver/mappers
- typed page builders

---

## 11. How `ibe-app` Should Consume Prismic Content

`ibe-app` should consume Prismic **only through `packages/cms`**.

### Recommended flow

```txt
ibe-app page/component
  -> packages/cms service
  -> packages/cms shared Prismic client
  -> Prismic API
```

### Example

- page calls `getLabels(locale)` from `packages/cms`
- page receives normalized content
- UI components render props only

### What `ibe-app` should not do

- create `@prismicio/client` instances directly
- fetch Prismic documents inside random UI components
- duplicate label mapping logic
- implement its own independent resolver layer

---

## 12. Enterprise-Level Rules

### Rule 1: No direct Prismic client creation inside `ibe-app`

All Prismic client creation belongs in:

- `packages/cms`
- or `prismic-app` write-side tooling only

### Rule 2: No duplicate Prismic logic inside app components

Pages/components in `ibe-app` must not:

- build Prismic queries
- parse raw Prismic documents
- recreate label/content mapping rules

### Rule 3: Prismic models, slices, and custom types are managed only from `prismic-app`

The source of truth for:

- customtypes
- Slice Machine config
- codegen config
- write/migration scripts

must be `apps/prismic-app`.

### Rule 4: Shared fetching logic lives in `packages/cms`

This includes:

- labels
- page content
- shared client helpers
- resolvers
- document mappers

### Rule 5: `ibe-app` should consume normalized data, not raw Prismic payloads

This makes:

- testing easier
- UI code cleaner
- future schema changes easier to absorb

### Rule 6: One canonical generated type source

Canonical:

- `apps/prismic-app/prismicio-types.d.ts`

Synced:

- `packages/cms/src/generated/prismicio-types.d.ts`

---

## 13. Example Code Snippets

### `packages/cms/src/prismicio.ts`

```ts
import * as prismic from "@prismicio/client";

const repositoryName = process.env.PRISMIC_REPOSITORY_NAME ?? "";

export function createPrismicClient(config: prismic.ClientConfig = {}) {
  return prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    ...config,
  });
}

export function getRepositoryName() {
  return repositoryName;
}
```

### `packages/cms/src/index.ts`

```ts
export * from "./prismicio";
export * from "./services/label-service";
export * from "./generated/prismicio-types";
export * from "./slices";
```

### `packages/cms/src/services/label-service.ts`

Phase 1 example:

```ts
import { createPrismicClient } from "../prismicio";

export async function getLabels(locale: string) {
  const client = createPrismicClient();

  const labels = await client.getSingle("ibe_labels", {
    lang: locale,
  });

  return labels.data;
}
```

Phase 1 recommendation:

- keep service simple
- normalize output before returning to `ibe-app`

Phase 2 example direction:

```ts
import { createPrismicClient } from "../prismicio";

export async function getHomePageContent(locale: string) {
  const client = createPrismicClient();
  const page = await client.getByUID("page", "home", { lang: locale });

  return {
    title: page.data.title,
    slices: page.data.slices,
  };
}
```

### `apps/ibe-app` usage example

Server-side page usage:

```ts
import { getLabels } from "@repo/cms";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function PassengerPage({ params }: PageProps) {
  const { locale } = await params;
  const labels = await getLabels(locale);

  return (
    <main>
      <h1>{labels.passenger?.title ?? "Passenger"}</h1>
    </main>
  );
}
```

---

## 14. Recommended Build / Codegen Flow

### Phase 1: labels

1. Update local source labels
2. Update Prismic document registry
3. Generate custom type models
4. Validate models
5. Generate/sync Prismic TypeScript types
6. Start Slice Machine
7. Push model changes to Prismic
8. Run dry-run content migration
9. Run real content migration
10. Verify in `ibe-app`

Commands:

```bash
pnpm prismic:models:generate
pnpm prismic:validate
pnpm prismic:types:generate
pnpm prismic:seed:dry
pnpm prismic:seed
```

### Phase 2: page content + slices

1. Add or update slice models in `packages/cms/src/slices`
2. Add/update custom types in `prismic-app`
3. Run codegen
4. Sync generated types
5. Update shared services in `packages/cms`
6. Consume normalized content in `ibe-app`

---

## 15. Phase 1 and Phase 2 Design Guidance

### Phase 1: Labels

Recommended scope:

- label JSON
- label registry
- custom type generation
- shared label service
- localized consumption in `ibe-app`

Architecture focus:

- keep structure simple
- centralize label fetch logic in `packages/cms`
- avoid introducing page-level CMS complexity too early

### Phase 2: Full page content and slices

Recommended additions:

- page content services
- slice rendering from `packages/cms`
- preview support
- richer typed mappers
- normalized page-level content contracts

Architecture focus:

- keep raw Prismic parsing in `packages/cms`
- expose stable content contracts to `ibe-app`

---

## 16. Prismic Environment Setup

Recommended environment variables:

```env
PRISMIC_REPOSITORY_NAME=your-repository
PRISMIC_ACCESS_TOKEN=your-read-token
PRISMIC_WRITE_TOKEN=your-write-token
PRISMIC_PREVIEW_SECRET=your-preview-secret
PRISMIC_PREVIEW_URL=http://localhost:3000
```

### Read token usage

Use for:

- shared client in `packages/cms`
- app read-side content fetching

### Write token usage

Use for:

- content migration
- update/create scripts
- Prismic write-side tooling in `prismic-app`

### Preview support

Recommended:

- preview helpers stay in `packages/cms`
- `ibe-app` consumes preview-aware services rather than raw preview logic

### Localization strategy

Recommended:

- map app locales to Prismic locales in shared helpers
- keep locale resolution centralized

Example:

```ts
const prismicLocaleMap = {
  en: "en-us",
  ja: "ja-jp",
};
```

---

## 17. Common Mistakes to Avoid

### Mistake 1: Creating a separate Prismic client inside `ibe-app`

Why it is bad:

- duplicates config
- causes drift
- spreads Prismic internals into app code

### Mistake 2: Letting `prismic-app` become a runtime dependency source

Why it is bad:

- `prismic-app` should own authoring, not application runtime behavior

### Mistake 3: Keeping two independent generated type sources

Why it is bad:

- drift risk
- confusing ownership

### Mistake 4: Putting shared services in `ibe-app`

Why it is bad:

- makes reuse harder
- couples main app to CMS implementation details

### Mistake 5: Returning raw Prismic payloads directly to components

Why it is bad:

- fragile UI contracts
- leaking schema details into UI

### Mistake 6: Mixing slice ownership with application ownership

Recommended:

- slice components in `packages/cms`
- model authoring in `prismic-app`

### Mistake 7: Running `prismic:types:generate` for content-only changes

Not required for:

- text value changes
- translated label changes

Use it only when model structure changes.

---

## 18. Parent `ibe` Automation

There are two possible approaches for the parent `ibe` orchestration custom
type.

### Option A: Manual maintenance

Manually edit:

```txt
apps/prismic-app/customtypes/ibe/index.json
```

Pros:

- simple at first

Cons:

- repeated manual updates
- easy to forget when adding new child pages
- higher maintenance risk

### Option B: Generator-driven automatic parent orchestration

Recommended.

Approach:

- read all registered Prismic documents from `prismic-document-registry.ts`
- exclude `ibe` itself
- generate `apps/prismic-app/customtypes/ibe/index.json` automatically
- create relationship fields for all registered child documents

Example generated field:

```json
"passenger": {
  "type": "Link",
  "config": {
    "label": "Passenger",
    "select": "document",
    "customtypes": ["passenger"]
  }
}
```

Why this is better:

- scales with new pages
- removes manual drift
- keeps `ibe` aligned with registry-driven model generation

### Recommendation

Use **automatic `ibe` generation** for enterprise maintainability.

---

## 19. Final Checklist to Verify the Setup

### Architecture checklist

- `ibe-app` does not create Prismic clients directly
- `prismic-app` owns Slice Machine and custom types
- `packages/cms` owns shared read-side Prismic helpers and services
- slices live in `packages/cms/src/slices`
- `prismicio.ts` shared implementation lives in `packages/cms`
- `prismic-app` uses a thin adapter only if needed

### Type generation checklist

- canonical generated file exists at:
  - `apps/prismic-app/prismicio-types.d.ts`
- synced generated copy exists at:
  - `packages/cms/src/generated/prismicio-types.d.ts`
- sync process is part of `prismic:types:generate`

### Prismic model checklist

- `pnpm prismic:models:generate` works
- `pnpm prismic:validate` works
- `pnpm prismic:types:generate` works
- Slice Machine shows expected models
- parent `ibe` includes expected child relationships

### App consumption checklist

- `ibe-app` imports content only from `@repo/cms`
- page components receive normalized data
- no duplicate label/content logic exists in `ibe-app`

### Migration checklist

- `pnpm prismic:seed:dry` works
- `pnpm prismic:seed` works
- content is visible in Prismic
- content is visible in `ibe-app`

---

## 20. Recommended Final Decision Summary

For this monorepo, the recommended architecture is:

- `apps/prismic-app` owns Prismic authoring, models, codegen, and write flows
- `packages/cms` owns shared read-side client, generated shared types, services, helpers, and slices
- `apps/ibe-app` consumes Prismic only through `packages/cms`
- canonical generated Prismic types live in `apps/prismic-app`
- synced generated types are copied into `packages/cms`
- use Slice Machine plus `prismic-ts-codegen`
- design Phase 1 for labels but prepare Phase 2 for page content and slices
- automate parent `ibe` generation from the registry

This gives you:

- clean ownership
- scalable team workflow
- strong shared typing
- reduced duplication
- a future-safe path from labels to full CMS content
