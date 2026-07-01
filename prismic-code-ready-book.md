# Prismic Code Ready Book

## Purpose

This document is a ready-to-follow implementation guide for the current Prismic setup across:

- `apps/web`
- `apps/prismic-app`
- `packages/cms`

It is written so a developer can either:

- copy the required file structure and logic
- or follow the steps and build the same setup in another project

## Target responsibilities

### `apps/web`

Use this app to:

- render UI
- load labels
- expose label API routes
- expose webhook revalidation route

### `apps/prismic-app`

Use this app to:

- manage Slice Machine
- store custom types
- generate models
- seed content
- hold Prismic write utilities

### `packages/cms`

Use this package to:

- centralize Prismic client creation
- centralize Prismic env helpers
- expose shared CMS services and generated types

---

## 1. Files needed in `packages/cms`

### Required folder

```txt
packages/cms/
  src/
    generated/
      prismicio-types.d.ts
    prismic/
      config.ts
      create-client.ts
      index.ts
      repository.ts
    services/
      content-page-service.ts
    index.ts
```

### Required responsibilities

#### `src/prismic/config.ts`

Purpose:

- shared env resolution
- repository config
- access token config
- helper to load env values into `process.env`

Key exports:

- `prismicConfig`
- `getSharedEnvValue`
- `loadSharedEnvIntoProcessEnv`

#### `src/prismic/repository.ts`

Purpose:

- validate repository name presence

Key export:

- `getRepositoryName`

#### `src/prismic/create-client.ts`

Purpose:

- create read client for all consuming apps

Key export:

- `createPrismicClient`

#### `src/prismic/index.ts`

Purpose:

- re-export Prismic utilities

#### `src/generated/prismicio-types.d.ts`

Purpose:

- shared generated Prismic types used by consuming packages/apps

#### `src/services/content-page-service.ts`

Purpose:

- shared Prismic content lookup example

#### `src/index.ts`

Purpose:

- export slices
- export Prismic helpers
- export shared CMS services

---

## 2. Files needed in `apps/prismic-app`

### Required folder

```txt
apps/prismic-app/
  customtypes/
    flight_search/
      index.json
    flight_select/
      index.json
    passenger/
      index.json
    ibe/
      index.json
    content_page/
      index.json
  scripts/
    generate-prismic-models.ts
    seed-prismic-content.ts
    validate-labels.ts
  src/
    app/
      layout.tsx
      page.tsx
      slice-simulator/
        page.tsx
    prismic/
      write-client.ts
    prismicio.ts
  prismic.config.json
  prismicCodegen.config.ts
  prismicio-types.d.ts
  slicemachine.config.json
  package.json
```

### Required responsibilities

#### `customtypes/*/index.json`

Purpose:

- actual Prismic custom type models used by Slice Machine and Prismic

#### `scripts/generate-prismic-models.ts`

Purpose:

- generate custom type JSON from the shared document registry
- generate parent `ibe` relationship model automatically

#### `scripts/seed-prismic-content.ts`

Purpose:

- create or update Prismic documents from local message content
- support dry-run and write mode

#### `scripts/validate-labels.ts`

Purpose:

- confirm generated model fields match expected contract
- detect duplicate generated field IDs

#### `src/prismic/write-client.ts`

Purpose:

- create write client for seed and migration operations
- use shared env helper from `packages/cms`

#### `src/prismicio.ts`

Purpose:

- local adapter file for Prismic app usage
- can simply re-export shared client creation

#### `prismicio-types.d.ts`

Purpose:

- main generated types file from Prismic codegen in `prismic-app`

#### `prismicCodegen.config.ts`

Purpose:

- define Prismic codegen behavior

#### `prismic.config.json`

Purpose:

- required Prismic app configuration

#### `slicemachine.config.json`

Purpose:

- required Slice Machine configuration

---

## 3. Files needed in `apps/web`

### Required folder

```txt
apps/web/
  messages/
    en.json
    ja.json
  src/
    app/
      api/
        labels/
          [locale]/
            route.ts
        revalidate/
          labels/
            route.ts
      [locale]/
        page.tsx
        flight-search/
          page.tsx
        passenger/
          page.tsx
    components/
      localized-labels.tsx
    i18n/
      label-version.ts
      load-messages.ts
      messages.ts
      prismic-document-registry.ts
      request.ts
      routing.ts
      use-label-messages.ts
    ibe/
      services/
        label-service.ts
      utils/
        resolve-prismic-labels.ts
```

### Required responsibilities

#### `messages/en.json`, `messages/ja.json`

Purpose:

- local label source
- current seed source for Prismic content
- current basis for the shared label contract

#### `src/i18n/messages.ts`

Purpose:

- expose local messages by locale
- build common label contract from all locales

#### `src/i18n/prismic-document-registry.ts`

Purpose:

- define tracked label documents:
  - `flight_search`
  - `flight_select`
  - `passenger`

This is currently the contract consumed by:

- `web`
- `prismic-app` scripts

#### `src/ibe/services/label-service.ts`

Purpose:

- main label orchestration service
- decide `local` vs `prismic`
- read parent `ibe`
- fetch child label documents
- resolve child docs into the shared label contract
- cache by locale with tags

#### `src/ibe/utils/resolve-prismic-labels.ts`

Purpose:

- map raw Prismic document fields back into the label contract shape

#### `src/app/api/labels/[locale]/route.ts`

Purpose:

- return final labels to browser
- include `source`
- include `version`

#### `src/i18n/label-version.ts`

Purpose:

- generate stable label hash used by browser cache comparison

#### `src/i18n/use-label-messages.ts`

Purpose:

- browser-side label loading
- fast localStorage display
- background refresh
- version-based update

#### `src/app/api/revalidate/labels/route.ts`

Purpose:

- webhook/manual revalidation endpoint
- clear cache tags after publish

#### `src/components/localized-labels.tsx`

Purpose:

- sample rendering page for loaded label values

---

## 4. Environment variables needed

### Shared Prismic read config

```env
PRISMIC_REPOSITORY_NAME=your-repo-name
PRISMIC_ACCESS_TOKEN=your-read-token
```

### Label source flag

```env
LABEL_SOURCE=local
```

or

```env
LABEL_SOURCE=prismic
```

### Prismic write operations

```env
PRISMIC_WRITE_TOKEN=your-write-token
```

### Webhook secret

```env
LABEL_REVALIDATE_SECRET=your-secret
```

### Optional document ID overrides

Examples:

```env
PRISMIC_FLIGHT_SEARCH_EN_DOCUMENT_ID=
PRISMIC_FLIGHT_SELECT_EN_DOCUMENT_ID=
PRISMIC_PASSENGER_EN_DOCUMENT_ID=
PRISMIC_FLIGHT_SEARCH_JA_DOCUMENT_ID=
PRISMIC_FLIGHT_SELECT_JA_DOCUMENT_ID=
PRISMIC_PASSENGER_JA_DOCUMENT_ID=
```

---

## 5. Commands needed

### Run web app

```bash
pnpm dev:web
```

### Manage Prismic models

Use Prismic Type Builder in the Prismic web UI.

### Generate Prismic models

```bash
pnpm prismic:models:generate
```

### Validate generated models

```bash
pnpm prismic:validate
```

### Generate Prismic types

```bash
pnpm prismic:types:generate
```

### Seed Prismic content dry-run

```bash
pnpm prismic:seed:dry
```

### Seed Prismic content write

```bash
pnpm prismic:seed
```

---

## 6. Copy-paste implementation order

### Step 1. Add shared Prismic client in `packages/cms`

Create:

- `config.ts`
- `repository.ts`
- `create-client.ts`
- `index.ts`

### Step 2. Add Prismic custom type app

Create:

- `prismic-app`
- `customtypes/*`
- `scripts/*`
- `write-client.ts`
- `prismicio.ts`

### Step 3. Add local message files in `web`

Create:

- `messages/en.json`
- `messages/ja.json`

### Step 4. Add document registry

Create:

- `prismic-document-registry.ts`

This is the current label-document source of truth.

### Step 5. Add label service and resolver

Create:

- `label-service.ts`
- `resolve-prismic-labels.ts`

### Step 6. Add labels API route

Create:

- `/api/labels/[locale]/route.ts`

### Step 7. Add browser cache hook

Create:

- `use-label-messages.ts`
- `label-version.ts`

### Step 8. Add webhook route

Create:

- `/api/revalidate/labels/route.ts`

### Step 9. Wire demo pages/components

Create:

- `LocalizedLabels`
- locale demo pages

---

## 7. Current known architectural limitation

Today `apps/prismic-app` scripts import document definitions from `apps/web`.

This works, but it is not the final enterprise target.

### Better target later

Move the label-document contract into:

```txt
packages/cms
```

Then:

- `web` consumes it
- `prismic-app` generates from it
- no app owns another app’s content contract

---

## 8. Recommended final enterprise direction

### Now

- keep current setup
- continue labels-first implementation

### Next

- move document registry into shared package
- unify locale map in one place
- keep version-based browser refresh

### Later

- expand from labels to page content and slices
- harden webhook security for production

---

## 9. Summary

To reproduce the current solution, the minimum building blocks are:

1. shared Prismic client in `packages/cms`
2. custom type + seed scripts in `apps/prismic-app`
3. message files + label runtime in `apps/web`
4. labels API + webhook revalidation route
5. browser cache hook with version comparison
