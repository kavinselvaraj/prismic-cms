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
    scripts/
    src/
      app/
      prismic/
        write-client.ts

packages/
  cms/
    src/
      generated/
        prismicio-types.d.ts
      prismic/
        config.ts
        create-client.ts
        repository.ts
      slices/
        HeroSection/
        PopularRoutes/
        RichTextSection/
      index.ts

  typescript-config/
```

## Responsibility Split

- `apps/web`: website routes, local label JSON, and app-level label services.
- `apps/prismic-app`: Slice Machine, custom type JSON, and Prismic migration or
  write utilities.
- `packages/cms`: shared Prismic client, generated Prismic types, and reusable
  slice components.
