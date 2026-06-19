# Prismic Team Guide

This guide is the single reference for the team to understand how local label
JSON becomes Prismic custom types and Prismic content in this project.

It covers:

- where labels are defined
- how custom types are generated
- how tabs and groups are created
- how to register new Prismic documents
- how to migrate model changes
- how to migrate content changes
- commands to run
- common examples and edge cases

## Project ownership

### Web team

Owns:

- `apps/web/messages/en.json`
- `apps/web/messages/ja.json`
- app UI pages
- local development labels

### Prismic team

Owns:

- `apps/web/src/i18n/prismic-document-registry.ts`
- `apps/prismic-app/customtypes`
- `apps/prismic-app/scripts`
- Slice Machine sync
- Prismic content migration

## Key files

### Local message source

- `apps/web/messages/en.json`
- `apps/web/messages/ja.json`

### Message loader

- `apps/web/src/i18n/messages.ts`

### Prismic document registry

- `apps/web/src/i18n/prismic-document-registry.ts`

### Generator

- `apps/prismic-app/scripts/generate-prismic-models.ts`

### Validation

- `apps/prismic-app/scripts/validate-labels.ts`

### Content migration

- `apps/prismic-app/scripts/seed-prismic-content.ts`

### Generated custom types

- `apps/prismic-app/customtypes/*/index.json`

## End-to-end flow

1. A developer adds labels in `en.json`
2. Matching labels are added in `ja.json` if needed
3. The Prismic document is registered in `prismic-document-registry.ts`
4. Generate custom type JSON:

   ```bash
   pnpm prismic:models:generate
   ```

   This now generates:

   - child custom types such as `flight_search`, `flight_select`, `passenger`
   - the parent `ibe` custom type automatically
   - document relationship fields under `ibe` for every registered child document

5. Validate generated custom type JSON:

   ```bash
   pnpm prismic:validate
   ```

6. If the custom type or slice model changed, generate Prismic TypeScript types:

   ```bash
   pnpm prismic:types:generate
   ```

7. Start the Prismic app and Slice Machine:

   ```bash
   pnpm dev:prismic
   pnpm slicemachine
   ```

8. Slice Machine syncs the model to Prismic
9. Preview content migration:

   ```bash
   pnpm prismic:seed:dry
   ```

10. Run content migration:

   ```bash
   pnpm prismic:seed
   ```

11. UI reads labels from local or Prismic based on environment

## Commands

### Generate custom types

```bash
pnpm prismic:models:generate
```

### Validate custom types

```bash
pnpm prismic:validate
```

### Generate Prismic TypeScript types

```bash
pnpm prismic:types:generate
```

Use this when:

- a custom type structure changes
- a slice model changes
- Prismic field names, tabs, groups, or shapes changed
- shared typed Prismic services need updated generated types

This command updates the generated TypeScript definitions used by the codebase.

In this repo, it writes to:

- `packages/cms/src/generated/prismicio-types.d.ts`

Use it after model changes, not for ordinary content-only changes.

Examples:

- if you add a new custom type like `passenger`, run it
- if you add a new field like `passport_expiry`, run it
- if you add a new tab or group, run it
- if you only changed the value from `First name` to `Given name`, you do not need it

### Start Prismic app

```bash
pnpm dev:prismic
```

### Start Slice Machine

```bash
pnpm slicemachine
```

### Preview content migration

```bash
pnpm prismic:seed:dry
```

### Run content migration

```bash
pnpm prismic:seed
```

### Migrate only English

```bash
pnpm prismic:seed:dry -- --locale en
pnpm prismic:seed -- --locale en
```

### Migrate only Japanese

```bash
pnpm prismic:seed:dry -- --locale ja
pnpm prismic:seed -- --locale ja
```

## How the registry works

Each Prismic document is declared in:

- `apps/web/src/i18n/prismic-document-registry.ts`

Example:

```ts
export function getPassengerDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "passenger",
    modelType: "custom",
    content: {
      passenger: messages.passenger,
    },
  } satisfies PrismicLabelDocument;
}
```

And added to:

```ts
export function getPrismicDocuments(locale: AppLocale = "en") {
  return [
    getFlightSearchDocument(locale),
    getFlightSelectDocument(locale),
    getPassengerDocument(locale),
  ] satisfies PrismicLabelDocument[];
}
```

The same registry is also used to generate the parent `ibe` custom type.

That means every registered document such as:

- `flight_search`
- `flight_select`
- `passenger`
- `payment`
- `seat`
- `review`

can automatically become a relationship field inside `ibe` when models are
generated.

## How JSON becomes Prismic fields

The generator reads `document.content` and converts the JSON shape into Prismic
fields.

## Core mapping rules

### 1. String -> Text

Input:

```json
{
  "passenger": {
    "first_name": "First name"
  }
}
```

Output:

- `Text`

### 2. `title`, `subtitle`, `description` -> StructuredText

Input:

```json
{
  "hero": {
    "title": "Book now",
    "subtitle": "Best fares",
    "description": "Long content"
  }
}
```

Output:

- `StructuredText`

### 3. `seo.*` fields stay Text

Input:

```json
{
  "seo": {
    "title": "SEO title",
    "description": "SEO description"
  }
}
```

Output:

- `Text`

### 4. Array of objects -> Group

Input:

```json
{
  "us_route": [
    {
      "code": "NRT",
      "name": "Narita Airport"
    }
  ]
}
```

Output:

- `Group`
  - `code` -> `Text`
  - `name` -> `Text`

### 5. Nested object section -> Tab

Input:

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name"
    }
  }
}
```

Output:

- `Personal Info` tab

### 6. Direct root field -> Main

Input:

```json
{
  "passenger": {
    "status": "Active"
  }
}
```

Output:

- `Main`

## Tab rules

### Current behavior

The generator uses flattened field paths.

Examples:

```txt
passenger.first_name
passenger.personal_info.first_name
passenger.travel_info.us_route
```

### Tab rule

- `modelId.field` -> `Main`
- `modelId.section.field` -> `Section` tab

### Examples

#### Input

```json
{
  "passenger": {
    "first_name": "First name"
  }
}
```

#### Output

- `Main`

#### Input

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name"
    }
  }
}
```

#### Output

- `Personal Info`

## Group rules

### Current behavior

If a field value is an array of objects, it becomes a Prismic `Group`.

### Example

#### Input

```json
{
  "passenger": {
    "travel_info": {
      "us_route": [
        {
          "code": "LAX",
          "name": "Los Angeles International Airport"
        }
      ]
    }
  }
}
```

#### Output

- `Travel Info` tab
  - `Us Route` -> `Group`
    - `Code` -> `Text`
    - `Name` -> `Text`

## Recommended JSON design rules

### Use direct fields for Main

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

### Use nested objects only when you want a tab

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name"
    }
  }
}
```

### Use array of objects when you want a Group

```json
{
  "passenger": {
    "us_route": [
      {
        "code": "NRT",
        "name": "Narita Airport"
      }
    ]
  }
}
```

### Keep group item fields flat

Good:

```json
{
  "route": [
    {
      "code": "NRT",
      "name": "Narita Airport"
    }
  ]
}
```

Avoid:

```json
{
  "route": [
    {
      "airport": {
        "code": "NRT"
      }
    }
  ]
}
```

### Provide at least one sample object in arrays

Good:

```json
{
  "us_route": [
    {
      "code": "LAX",
      "name": "Los Angeles International Airport"
    }
  ]
}
```

Avoid:

```json
{
  "us_route": []
}
```

An empty array does not help the generator infer group fields.

## Demo examples

### Demo 1: Simple passenger

#### Input

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

#### Output

- Main
  - First Name
  - Last Name

### Demo 2: Passenger with Group

#### Input

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name",
    "us_route": [
      {
        "code": "NRT",
        "name": "Narita Airport"
      }
    ]
  }
}
```

#### Output

- Main
  - First Name
  - Last Name
  - Us Route
    - Code
    - Name

### Demo 3: Passenger with tabs and groups

#### Input

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "Given name",
      "last_name": "Family name",
      "middle_name": "Middle name",
      "date_of_birth": "Date of birth"
    },
    "travel_info": {
      "region_label": "Preferred route region",
      "us_route": [
        {
          "code": "LAX",
          "name": "Los Angeles International Airport"
        }
      ],
      "asia_route": [
        {
          "code": "NRT",
          "name": "Narita International Airport"
        }
      ]
    },
    "documents": {
      "passport_number": "Passport number",
      "passport_expiry": "Passport expiry date",
      "nationality": "Nationality"
    },
    "preferences": {
      "meal_preference": "Meal preference",
      "seat_preference": "Seat preference",
      "special_assistance": "Special assistance"
    }
  }
}
```

#### Output

- `Personal Info` tab
- `Travel Info` tab
- `Documents` tab
- `Preferences` tab

With `us_route` and `asia_route` generated as `Group` fields.

## Passenger demo in this repo

The project already includes a passenger example.

### Locale messages

- `apps/web/messages/en.json`
- `apps/web/messages/ja.json`

### Demo page

- `/en/passenger`
- `/ja/passenger`

### Route file

- `apps/web/src/app/[locale]/passenger/page.tsx`

## Step-by-step: add a new label domain

Example: a developer adds a new `payment` section.

### Step 1

Add labels in:

- `apps/web/messages/en.json`
- `apps/web/messages/ja.json`

### Step 2

Register a new document in:

- `apps/web/src/i18n/prismic-document-registry.ts`

Example:

```ts
export function getPaymentDocument(locale: AppLocale = "en") {
  const messages = getLocaleMessages(locale);

  return {
    modelId: "payment",
    modelType: "custom",
    content: {
      payment: messages.payment,
    },
  } satisfies PrismicLabelDocument;
}
```

### Step 3

Add it to:

```ts
getPrismicDocuments(locale)
```

### Step 4

Generate model:

```bash
pnpm prismic:models:generate
```

This command now does two things:

1. generates the new child custom type
2. updates `apps/prismic-app/customtypes/ibe/index.json` automatically

So you do not need to manually edit the `ibe` custom type JSON for each new
page.

### Step 5

Validate:

```bash
pnpm prismic:validate
```

### Step 6

Start Slice Machine:

```bash
pnpm dev:prismic
pnpm slicemachine
```

### Step 7

If the custom type or slice model changed, generate Prismic TypeScript types:

```bash
pnpm prismic:types:generate
```

### Step 8

Push/sync the custom type to Prismic.

This includes:

- the new child custom type
- the updated `ibe` parent custom type

### Step 9

Preview content migration:

```bash
pnpm prismic:seed:dry -- --locale en
pnpm prismic:seed:dry -- --locale ja
```

### Step 10

Run content migration:

```bash
pnpm prismic:seed -- --locale en
pnpm prismic:seed -- --locale ja
```

## Model migration vs content migration

This distinction is important.

### Model migration

Changes the structure:

- custom type
- tabs
- fields
- groups
- parent `ibe` document links

Commands:

```bash
pnpm prismic:models:generate
pnpm prismic:validate
pnpm prismic:types:generate
pnpm dev:prismic
pnpm slicemachine
```

### Content migration

Changes actual values in Prismic documents.

Commands:

```bash
pnpm prismic:seed:dry
pnpm prismic:seed
```

## Manual migration teaching flow

When you want to learn the migration process, do this exact sequence:

1. Update local JSON
2. Update Prismic registry
3. Run:

   ```bash
   pnpm prismic:models:generate
   ```

   This also updates the parent `ibe` model automatically.

4. Run:

   ```bash
   pnpm prismic:validate
   ```

5. Run:

   ```bash
   pnpm prismic:types:generate
   ```

6. Run:

   ```bash
   pnpm dev:prismic
   pnpm slicemachine
   ```

7. Push custom type changes in Slice Machine
8. Preview content write:

   ```bash
   pnpm prismic:seed:dry -- --locale en
   pnpm prismic:seed:dry -- --locale ja
   ```

9. Run actual content migration:

   ```bash
   pnpm prismic:seed -- --locale en
   pnpm prismic:seed -- --locale ja
   ```

10. Verify content in Prismic UI
11. Verify labels in the web app

## What `seed:dry` means

```bash
pnpm prismic:seed:dry
```

This does:

- read local content
- compute what would be created or updated
- print operations
- not write to Prismic

Use it first whenever you are learning or when the content change is large.

## What `seed` means

```bash
pnpm prismic:seed
```

This does:

- create missing documents
- update existing documents
- write values to Prismic

## Common mistakes

### 1. Expecting a new tab from flat fields

Input:

```json
{
  "passenger": {
    "first_name": "First name"
  }
}
```

Result:

- stays in `Main`

If you want a tab, you need:

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name"
    }
  }
}
```

### 2. Expecting Group from array of strings

Avoid:

```json
{
  "tags": ["adult", "student"]
}
```

Prefer:

```json
{
  "tags": [
    {
      "value": "adult"
    }
  ]
}
```

### 3. Using empty arrays for group inference

Avoid:

```json
{
  "us_route": []
}
```

### 4. Expecting content relationship fields from plain labels

Relationships are not automatically inferred from label text.
They need explicit model support.

Exception in this project:

- the parent `ibe` document links are now generated automatically from the
  registered Prismic documents
- this happens during `pnpm prismic:models:generate`
- so if a new child document is registered, `ibe` will pick it up automatically

## Checklist

Before sharing a new label domain with the team, confirm:

1. `en.json` is updated
2. `ja.json` is updated if required
3. `prismic-document-registry.ts` is updated
4. JSON structure reflects intended `Main`, tabs, and groups
5. `pnpm prismic:models:generate` passes
6. `pnpm prismic:validate` passes
7. `pnpm prismic:types:generate` is run when model shape changed
8. Slice Machine shows expected tabs and fields
9. `pnpm prismic:seed:dry` looks correct
10. `pnpm prismic:seed` completes successfully
11. Web demo page displays the data correctly

## Summary

The simplest mental model is:

- string -> `Text`
- `title` / `subtitle` / `description` -> `StructuredText`
- `modelId.field` -> `Main`
- `modelId.section.field` -> new tab
- array of objects -> `Group`
- `prismic:models:generate` -> build child custom type JSON and auto-update `ibe`
- `prismic:types:generate` -> refresh generated TypeScript types after model changes
- Slice Machine push -> update Prismic model
- `prismic:seed:dry` -> preview content migration
- `prismic:seed` -> perform content migration

## Parent `ibe` automation

The project now automatically generates the parent `ibe` custom type from the
registered Prismic documents.

### What this means

When a new document is added to:

- `apps/web/src/i18n/prismic-document-registry.ts`

and you run:

```bash
pnpm prismic:models:generate
```

the generator will:

1. generate the child custom type JSON
2. regenerate `apps/prismic-app/customtypes/ibe/index.json`
3. add a document relationship field under `ibe`

### Example

If `passenger` is registered, the generated `ibe` model will contain:

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

### Team impact

Before this automation:

- every new page required a manual edit to `apps/prismic-app/customtypes/ibe/index.json`

Now:

- that manual step is no longer needed

The only required step is:

1. register the document
2. run `pnpm prismic:models:generate`

If the team follows these rules while shaping JSON, the generated Prismic custom
types and migrated content will stay predictable.
