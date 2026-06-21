# Prismic Operations Checklist

## Purpose

This document is a practical checklist for developers and content teams working with the current Prismic setup.

## A. Before starting development

- confirm `PRISMIC_REPOSITORY_NAME`
- confirm `PRISMIC_ACCESS_TOKEN`
- confirm `LABEL_SOURCE`
- confirm `PRISMIC_WRITE_TOKEN` for seed operations
- confirm `LABEL_REVALIDATE_SECRET` for webhook testing

## B. When adding a new label page/domain

Example:

- `payment`
- `seat`
- `review`

### Steps

1. add labels to all supported locale message files
2. update `prismic-document-registry.ts`
3. run model generation
4. validate generated models
5. review generated custom type JSON
6. seed content
7. update `ibe` parent relationships if needed
8. publish in Prismic
9. verify webhook refresh

## C. Commands

### Generate models

```bash
pnpm prismic:models:generate
```

### Validate models

```bash
pnpm prismic:validate
```

### Generate types

```bash
pnpm prismic:types:generate
```

### Dry-run content seed

```bash
pnpm prismic:seed:dry
```

### Write content seed

```bash
pnpm prismic:seed
```

## D. Webhook verification checklist

- webhook is saved in Prismic
- webhook URL is reachable
- secret matches app env
- publish event returns `200`
- terminal shows `[labels-revalidate] success`
- next label request shows `[label-service] PRISMIC API HIT`
- browser updates localStorage and UI

## E. Common failure patterns

### Webhook succeeded but UI did not change

Check:

- browser localStorage
- browser fetched `/api/labels/[locale]`
- response version changed
- label source is `prismic`

### Prismic content exists but labels are blank

Check:

- field IDs in generated custom types
- shape of group fields
- mapping logic in `resolve-prismic-labels.ts`

### Seed script works differently from app runtime

Check:

- shared env values
- `.env.local`
- `PRISMIC_WRITE_TOKEN`
- document ID override env variables

### Labels come from local instead of Prismic

Check:

```env
LABEL_SOURCE=prismic
```

## F. Review checklist for pull requests

- new labels added to all supported locales
- document registry updated
- generated models reviewed
- validate step passed
- seed dry-run checked
- webhook still works
- no direct Prismic client creation inside random app files
- shared CMS client reused

## G. Current architecture boundaries

### Good

- shared client in `packages/cms`
- Prismic app owns custom types and seed scripts
- web app owns label consumption and API routes

### Still to improve later

- move document registry into shared package
- strengthen production webhook security
- make label contract fully shared and typed outside app-local message ownership
