# Project Structure

```txt
apps/
  ibe-app/
    api-client/
    app/
    components/
    mock/
    modules/
    store/
    types/

  web/
    src/
      app/
      content/
        home/
          lang/en.json
          home.schema.ts
          home.service.ts
          types.ts
        about/
          lang/en.json
          about.schema.ts
          about.service.ts
          types.ts
        shared/
          lang/en.json
          shared.schema.ts
          shared.service.ts
          types.ts
      lib/prismic/
        client.ts
        config.ts
        create-client.ts
        label-resolver.ts
        repository.ts
        types.ts

  prismic-app/
    customtypes/
    src/
      app/
      generated/
      prismic/
        config.ts
        create-client.ts
        repository.ts
        write-client.ts

packages/
  cms/
    src/
      slices/
        HeroSection/
        PopularRoutes/
        RichTextSection/
      index.ts

  typescript-config/

scripts/
  generate-prismic-models.ts
  validate-labels.ts
  generate-figma-label-map.ts
  seed-prismic-content.ts

prismic/
  figma-label-map.json
```

## Responsibility Split

- `apps/web`: website routes, local content JSON, page schemas, page services,
  and Prismic read/fallback logic.
- `apps/prismic-app`: Slice Machine, custom type JSON, and Prismic migration or
  write utilities.
- `packages/cms`: reusable slice components only.
