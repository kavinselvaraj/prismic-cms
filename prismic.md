You are a senior solution architect and enterprise Next.js + Prismic developer.

I am building a pnpm monorepo website using Next.js App Router and Prismic.

I want a solid enterprise Prismic setup with this architecture:

- apps/web
  - Actual Next.js website application
  - Consumes CMS content from packages/cms
  - Does not directly contain Prismic modeling files
  - Uses React Server Components where possible

- apps/prismic-app
  - Dedicated Prismic/Slice Machine app
  - Used only by developers to create/edit/sync Prismic Page Types, Custom Types, and Slices
  - Owns Slice Machine configuration
  - Should point Slice Machine slice libraries to packages/cms/src/slices
  - Should generate/update custom type/page type models in apps/prismic-app/customtypes or the correct Prismic model directory based on the installed Prismic/Slice Machine version
  - Should include slice simulator support if required by Prismic

- packages/cms
  - Shared internal CMS package
  - Contains Prismic client
  - Contains Prismic services
  - Contains generated Prismic types
  - Contains reusable Slice components
  - Contains label resolver
  - Contains page-level JSON label files if needed
  - Export clean APIs to apps/web

Main requirement:
Developers create page-level language JSON files first, for example en.json. These JSON files define the website content/config/labels used by React components. Then these JSON files should be converted into Prismic Page Types or Custom Types. Each website page should have one page-level Prismic model.

Important terminology:
- For website pages, prefer Prismic Page Types if the installed Prismic/Slice Machine version supports Page Types.
- For non-page reusable documents like header, footer, navigation, global settings, and shared labels, use Custom Types.
- If the project uses the older Slice Machine model format where everything is stored under customtypes, keep the folder naming compatible with that version.
- Keep field IDs stable forever because Prismic content depends on them.

Target monorepo structure:

apps/
  web/
    src/
      app/
        [locale]/
          page.tsx
          about/
            page.tsx
      components/
      lib/

  prismic-app/
    package.json
    slicemachine.config.json
    prismic.config.json
    customtypes/
      home_page/
        index.json
      about_page/
        index.json
      shared_labels/
        index.json
    src/
      app/
        slice-simulator/
          page.tsx
      prismicio.ts

packages/
  cms/
    package.json
    src/
      index.ts

      prismic/
        client.ts
        config.ts
        repository.ts
        types.ts
        create-client.ts
        label-resolver.ts

      features/
        home/
          lang/
            en.json
          home.schema.ts
          home.service.ts
          types.ts

        about/
          lang/
            en.json
          about.schema.ts
          about.service.ts
          types.ts

      shared/
        lang/
          en.json
        shared.schema.ts
        shared.service.ts
        types.ts

      slices/
        HeroSection/
          index.tsx
          model.json
          mocks.json
        PopularRoutes/
          index.tsx
          model.json
          mocks.json
        RichTextSection/
          index.tsx
          model.json
          mocks.json

      generated/
        prismic-types.ts

scripts/
  generate-prismic-models.ts
  validate-labels.ts
  generate-figma-label-map.ts

prismic/
  figma-label-map.json

Root package requirements:
- pnpm workspace
- TypeScript
- tsx for scripts
- zod for schema validation
- @prismicio/client
- @prismicio/react
- @prismicio/next
- Slice Machine packages inside apps/prismic-app

Please implement the full setup.

Architecture rules:

1. apps/web must not directly call Prismic client.
2. apps/web must import only from @repo/cms.
3. UI components must not call Prismic directly.
4. Server page components can call CMS services from @repo/cms.
5. Prismic client must live inside packages/cms.
6. Slices must live inside packages/cms/src/slices.
7. apps/prismic-app must be configured so Slice Machine can create/edit/use slices from packages/cms/src/slices.
8. apps/prismic-app is the only place developers run Slice Machine.
9. Page-specific content/config/labels should not be stored in one huge Prismic document.
10. Each page should have one Prismic page-level model.
11. Shared/common labels should be in a separate shared model.
12. Redux must not be used for CMS page content.
13. Use server-side fetching for CMS page content wherever possible.
14. Client components should receive CMS labels/content as props.
15. Field IDs must be stable, readable, and generated consistently.
16. Figma layer names should map to label keys and Prismic field IDs.

Create sample JSON files.

packages/cms/src/features/home/lang/en.json:

{
  "page": "home",
  "modelId": "home_page",
  "modelType": "page",
  "uid": "home",
  "sections": {
    "hero": {
      "title": "Book your next trip with confidence",
      "subtitle": "Search flights, compare prices, and manage your journey easily.",
      "primaryCta": "Search flights",
      "secondaryCta": "View offers"
    },
    "popularRoutes": {
      "title": "Popular routes",
      "viewAll": "View all routes"
    }
  },
  "seo": {
    "metaTitle": "Flight Booking - Home",
    "metaDescription": "Search and book flights easily."
  }
}

packages/cms/src/shared/lang/en.json:

{
  "modelId": "shared_labels",
  "modelType": "custom",
  "common": {
    "buttons": {
      "search": "Search",
      "submit": "Submit",
      "cancel": "Cancel",
      "continue": "Continue"
    },
    "validation": {
      "required": "This field is required"
    }
  }
}

Create Zod schemas:
- packages/cms/src/features/home/home.schema.ts
- packages/cms/src/features/about/about.schema.ts
- packages/cms/src/shared/shared.schema.ts

The schemas should validate:
- page
- modelId
- modelType
- sections
- seo
- required labels
- stable structure

Create scripts/generate-prismic-models.ts.

This script should:
- Read packages/cms/src/features/*/lang/en.json
- Read packages/cms/src/shared/lang/en.json
- Validate every JSON file with its Zod schema
- Generate Prismic model JSON
- Output page models into apps/prismic-app/customtypes/{modelId}/index.json or the correct current Prismic model folder
- Output shared model into apps/prismic-app/customtypes/shared_labels/index.json
- Generate stable Prismic field IDs
- Convert nested keys into snake_case field IDs
- Example: sections.hero.title -> hero_title
- Example: sections.hero.primaryCta -> hero_primary_cta
- Example: seo.metaTitle -> seo_meta_title
- Generate readable labels
- Example: hero_primary_cta -> Hero Primary CTA
- Use Rich Text / StructuredText for title, subtitle, description fields
- Use Text / Key Text for CTA, button, short labels
- Use UID field for page models if needed
- Generate SEO fields
- Support future metadata-driven field types

Generated model example:

apps/prismic-app/customtypes/home_page/index.json

{
  "id": "home_page",
  "label": "Home Page",
  "format": "custom",
  "repeatable": false,
  "status": true,
  "json": {
    "Main": {
      "hero_title": {
        "type": "StructuredText",
        "config": {
          "label": "Hero Title",
          "single": "heading1,heading2,strong,em"
        }
      },
      "hero_subtitle": {
        "type": "StructuredText",
        "config": {
          "label": "Hero Subtitle",
          "single": "paragraph,strong,em"
        }
      },
      "hero_primary_cta": {
        "type": "Text",
        "config": {
          "label": "Hero Primary CTA"
        }
      },
      "hero_secondary_cta": {
        "type": "Text",
        "config": {
          "label": "Hero Secondary CTA"
        }
      },
      "popular_routes_title": {
        "type": "StructuredText",
        "config": {
          "label": "Popular Routes Title",
          "single": "heading2,heading3,strong,em"
        }
      },
      "popular_routes_view_all": {
        "type": "Text",
        "config": {
          "label": "Popular Routes View All"
        }
      },
      "seo_meta_title": {
        "type": "Text",
        "config": {
          "label": "SEO Meta Title"
        }
      },
      "seo_meta_description": {
        "type": "Text",
        "config": {
          "label": "SEO Meta Description"
        }
      }
    }
  }
}

Create packages/cms/src/prismic/client.ts.

Requirements:
- Create and export a reusable Prismic client factory.
- Read repository name and access token from environment variables.
- Support routes configuration.
- Support preview configuration if needed.
- Do not expose access token to client-side code.

Create packages/cms/src/prismic/label-resolver.ts.

Function:

getPageLabels({
  page,
  locale
})

Requirements:
- Fetch page-specific Prismic document by modelId/uid.
- Fetch shared labels document.
- Convert flat Prismic fields back into nested label object.
- Merge shared labels and page labels.
- Return typed labels.
- Fallback to local en.json in development when Prismic is missing.
- Never break the website because of missing optional CMS labels.
- Log missing labels clearly in development.
- Throw only for critical structure errors in production.
- Support locale fallback.
- Keep the returned API clean:

const labels = await getPageLabels({
  page: "home",
  locale: "en"
});

labels.sections.hero.title
labels.sections.hero.primaryCta
labels.common.buttons.search

Create packages/cms/src/features/home/home.service.ts.

Example:

import { getPageLabels } from "../../prismic/label-resolver";
import type { AppLocale } from "../../prismic/types";

export async function getHomePageContent(locale: AppLocale) {
  return getPageLabels({
    page: "home",
    locale
  });
}

Create packages/cms/src/slices.

Add these sample slices:
- HeroSection
- PopularRoutes
- RichTextSection

Each slice should have:
- index.tsx
- model.json
- mocks.json

Important:
- Slice components should be inside packages/cms/src/slices.
- apps/web should import slice components or SliceZone components from @repo/cms.
- apps/prismic-app should use the same slice library for Slice Machine.

Create packages/cms/src/index.ts.

It should export:
- Prismic services
- AppLocale types
- page content services
- slice components map
- generated types

Example:

export * from "./prismic/types";
export * from "./features/home/home.service";
export * from "./features/about/about.service";
export { components as prismicSliceComponents } from "./slices";

Create packages/cms/src/slices/index.ts.

Example:

import { HeroSection } from "./HeroSection";
import { PopularRoutes } from "./PopularRoutes";
import { RichTextSection } from "./RichTextSection";

export const components = {
  hero_section: HeroSection,
  popular_routes: PopularRoutes,
  rich_text_section: RichTextSection
};

Create apps/web/src/app/[locale]/page.tsx.

Requirements:
- Server Component
- Fetch CMS content using getHomePageContent from @repo/cms
- Pass labels/content to components
- Use metadata from CMS SEO fields
- Do not use Redux
- Do not make the whole page client-side

Example:

import { getHomePageContent } from "@repo/cms";
import { HeroSection } from "@repo/cms/slices/HeroSection";

export async function generateMetadata({ params }) {
  const content = await getHomePageContent(params.locale);

  return {
    title: content.seo.metaTitle,
    description: content.seo.metaDescription
  };
}

export default async function HomePage({ params }) {
  const content = await getHomePageContent(params.locale);

  return (
    <>
      <HeroSection labels={content.sections.hero} />
    </>
  );
}

Create apps/prismic-app configuration.

Requirements:
- Slice Machine runs from apps/prismic-app.
- The slice library should point to packages/cms/src/slices.
- Custom/Page type model output should be under apps/prismic-app.
- Include scripts:

{
  "scripts": {
    "dev": "next dev -p 3001",
    "slicemachine": "start-slicemachine",
    "prismic:models:generate": "tsx ../../scripts/generate-prismic-models.ts",
    "prismic:models:validate": "tsx ../../scripts/validate-labels.ts"
  }
}

Use the correct package names and commands for the installed Slice Machine version. If the generated project uses a different command, keep compatibility and document it.

Create root package.json scripts:

{
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:prismic": "pnpm --filter prismic-app dev",
    "slicemachine": "pnpm --filter prismic-app slicemachine",
    "cms:generate": "tsx scripts/generate-prismic-models.ts",
    "cms:validate": "tsx scripts/validate-labels.ts",
    "cms:check": "pnpm cms:generate && pnpm cms:validate"
  }
}

Create validation script:

scripts/validate-labels.ts

It should:
- Validate all page lang/en.json files
- Validate shared/lang/en.json
- Check every JSON key exists in generated Prismic model
- Check every Figma label key exists in JSON
- Check generated field IDs are stable
- Detect duplicate Prismic field IDs
- Detect missing fields
- Detect unused Figma mappings
- Fail CI with non-zero exit code when validation fails

Create Figma mapping:

prismic/figma-label-map.json

Example:

[
  {
    "figmaPage": "Home",
    "figmaSection": "Hero",
    "figmaLayer": "Hero / Title",
    "labelKey": "sections.hero.title",
    "modelId": "home_page",
    "prismicFieldId": "hero_title"
  },
  {
    "figmaPage": "Home",
    "figmaSection": "Hero",
    "figmaLayer": "Hero / Primary CTA",
    "labelKey": "sections.hero.primaryCta",
    "modelId": "home_page",
    "prismicFieldId": "hero_primary_cta"
  }
]

Create scripts/generate-figma-label-map.ts.

It should:
- Read page JSON files
- Generate default Figma mapping entries
- Output prismic/figma-label-map.json
- Preserve manually edited mappings if they already exist

Add TypeScript types:

packages/cms/src/prismic/types.ts

Create:
- AppLocale
- PageName
- ModelId
- LabelSource
- SharedLabels
- HomePageLabels
- PageLabels<T>
- GetPageLabelsOptions

Add README documentation.

README should explain:
1. How the monorepo is structured
2. Why apps/prismic-app exists
3. Why slices live inside packages/cms
4. How developers create a new page en.json
5. How to generate Prismic models
6. How to open Slice Machine
7. How to add or edit slices
8. How to sync models to Prismic
9. How apps/web consumes CMS content
10. How Figma label mapping works
11. How shared labels work
12. How fallback from Prismic to local JSON works
13. How to add another locale, for example ja.json
14. How CI validates CMS labels and Prismic models

Also add example flow:

Developer workflow:
1. Add packages/cms/src/features/contact/lang/en.json
2. Add contact.schema.ts
3. Run pnpm cms:generate
4. Confirm model appears under apps/prismic-app/customtypes/contact_page/index.json
5. Run pnpm slicemachine
6. Review/sync model in Prismic
7. Add content in Prismic
8. Use getContactPageContent in apps/web
9. Keep Figma layer names mapped to label keys

Do not:
- Put all labels in one huge Prismic document.
- Put slices directly inside apps/web.
- Put Prismic client directly inside apps/web components.
- Use Redux for CMS labels/content.
- Make every page a Client Component.
- Hardcode text inside React components.
- Generate unstable/random Prismic field IDs.
- Break existing Prismic field IDs when labels are renamed.

Before coding:
1. Show the final proposed folder structure.
2. Explain how apps/prismic-app, packages/cms, and apps/web communicate.
3. Then implement file by file.
4. Include complete code, not placeholders.
5. Include package.json scripts.
6. Include README.
7. Include validation and generation scripts.