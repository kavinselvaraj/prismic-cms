# Prismic Architecture

This project separates content ownership from slice rendering.

## Ownership

### `apps/web`

The web app owns page content definitions and read-side CMS logic.

Developers add or update local JSON here:

```txt
apps/web/src/content/home/lang/en.json
apps/web/src/content/about/lang/en.json
apps/web/src/content/shared/lang/en.json
```

The web app also owns:

```txt
apps/web/src/content/**/**.schema.ts
apps/web/src/content/**/**.service.ts
apps/web/src/lib/prismic/
```

Server components call local page services. Page services read Prismic first and
fall back to local JSON during development.

### `apps/prismic-app`

The Prismic app owns Slice Machine, custom type files, and write/migration
utilities.

```txt
apps/prismic-app/customtypes/
apps/prismic-app/slicemachine.config.json
apps/prismic-app/src/prismic/
```

One CMS owner should run Slice Machine, sync custom types, and seed/configure
Prismic documents.

### `packages/cms`

The CMS package owns only reusable slice rendering components.

```txt
packages/cms/src/slices/
```

Do not put page JSON, Prismic clients, page services, schemas, or migration code
inside `packages/cms`.

## Developer Flow

1. A web developer adds or updates JSON under `apps/web/src/content`.
2. The developer updates the matching Zod schema and page service in `apps/web`.
3. The developer runs `pnpm cms:check`.
4. The CMS owner runs `pnpm cms:generate`.
5. The CMS owner reviews generated files under `apps/prismic-app/customtypes`.
6. The CMS owner syncs the custom types in Slice Machine.
7. The CMS owner seeds initial content with `pnpm cms:seed` or edits it in Prismic.

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

## Rules

- `@repo/cms` exports slices only.
- `apps/web` owns page services and Prismic read client code.
- `apps/prismic-app` owns Prismic write client code.
- UI components must not call Prismic directly.
- Redux must not be used for CMS page content.
- Real Prismic tokens must stay in `.env.local`.
