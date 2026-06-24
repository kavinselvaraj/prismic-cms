# Prismic Label Migration

This guide migrates label content for one application source at a time. It is
intended for the IBE application without changing web application content.

## IBE Input

Create one JSON file per supported locale:

```txt
apps/ibe-app/messages/en.json
apps/ibe-app/messages/ja.json
apps/ibe-app/messages/ko.json
apps/ibe-app/messages/th.json
apps/ibe-app/messages/zh-cn.json
apps/ibe-app/messages/zh-tw.json
```

Use the `documents` section for every Prismic child document:

```json
{
  "documents": {
    "flight_search": {
      "airport": {
        "label": "Airport"
      }
    },
    "passenger": {
      "first_name": "First name"
    }
  },
  "shared": {
    "buttons": {
      "continue": "Continue"
    }
  }
}
```

Every direct child of `documents` becomes a Custom Type. The `shared` section
does not become a Prismic document.

All locale files must contain the same document and field structure. Values
may be translated, but keys must remain consistent.

## Generate IBE Models

Run these commands from the monorepo root:

```powershell
pnpm --filter prismic-app prismic:models:generate -- --source ibe-app
pnpm --filter prismic-app prismic:validate -- --source ibe-app
```

The generator creates child Custom Types and updates the configured IBE parent
model relationship fields.

Open Slice Machine, review the generated models, and push the changes to
Prismic. Then generate TypeScript types:

```powershell
pnpm prismic:types:generate
```

## Migrate Child Content

Seed English IBE child documents:

```powershell
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale en --write
```

Seed each additional locale separately:

```powershell
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale ja --write
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale ko --write
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale th --write
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale zh-cn --write
pnpm --filter prismic-app prismic:seed -- --source ibe-app --locale zh-tw --write
```

Before running a locale command, confirm that its Prismic language ID is
configured in the seed script and matches the repository language settings.

## Link the IBE Parent

The seed script creates or updates child documents only. It does not create or
link the parent singleton.

In Prismic, create one `ibe` singleton for each locale and link the child
documents created above:

```txt
IBE (en-us)
  -> flight_search
  -> passenger

IBE (ja-jp)
  -> flight_search
  -> passenger
```

Publish all child documents and the parent document.

## Parent Ownership Rule

One Prismic singleton type should have one application owner.

```txt
web application     -> web parent singleton
ibe-app application -> ibe parent singleton
```

Do not use the same `ibe` singleton as independent content containers for both
applications. If web currently uses `ibe`, migrate web to its own `web` parent
before treating the two applications as separate Prismic domains.

## Verify

1. Set `LABEL_SOURCE=prismic` for `ibe-app`.
2. Open an IBE page for each locale.
3. Confirm the server log reports Prismic as the selected label source.
4. Confirm the UI displays the published Prismic values.
5. Change one Prismic label, publish it, and reload the page to confirm the
   direct no-cache flow retrieves the new value.
