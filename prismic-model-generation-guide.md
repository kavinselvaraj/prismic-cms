# Prismic Model Generation Guide

This document explains how to provide JSON input for Prismic model generation
and what output to expect in Slice Machine / Prismic custom types.

It is intended for developers who add labels in local JSON and need to
understand how those labels are converted into Prismic custom type fields.

## Purpose

In this project:

- developers define labels in `apps/web/messages/en.json`
- the Prismic registry maps those labels into Prismic documents
- the generator creates custom type JSON under
  `apps/prismic-app/customtypes`

The generator reads the JSON shape and decides:

- which fields go to `Main`
- when to create a new tab
- when to create a `Text` field
- when to create a `StructuredText` field
- when to create a `Group`

## Files involved

- Local labels:
  - `apps/web/messages/en.json`
  - `apps/web/messages/ja.json`

- Prismic registry:
  - `packages/cms/src/prismic/document-registry.ts`

- Generator:
  - `apps/prismic-app/scripts/generate-prismic-models.ts`

- Generated custom types:
  - `apps/prismic-app/customtypes/*/index.json`

## End-to-end flow

1. Add labels to `en.json`
2. Add matching labels to `ja.json` if required
3. Register the document in `prismic-document-registry.ts`
4. Run:

   ```bash
   pnpm prismic:models:generate
   ```

5. Validate:

   ```bash
   pnpm prismic:validate
   ```

6. Review generated custom type JSON
7. Open Slice Machine and sync to Prismic

## Basic concept

The generator reads the `content` object from a Prismic label document.

Example registry shape:

```ts
{
  modelId: "passenger",
  modelType: "custom",
  content: {
    passenger: messages.passenger,
  },
}
```

If `messages.passenger` contains:

```json
{
  "first_name": "First name",
  "last_name": "Last name"
}
```

then the generator reads paths like:

```txt
passenger.first_name
passenger.last_name
```

## JSON input to Prismic output mapping

### Case 1: Simple string field

### Input

```json
{
  "passenger": {
    "first_name": "First name"
  }
}
```

### Output

- `Main`
  - `First Name` -> `Text`

### Why

Simple string values become `Text` fields.

---

### Case 2: Multiple simple fields

### Input

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

### Output

- `Main`
  - `First Name` -> `Text`
  - `Last Name` -> `Text`

### Why

These are direct fields under the document root, so they stay in `Main`.

---

### Case 3: Long text style fields

### Input

```json
{
  "home_page": {
    "hero": {
      "title": "Book your next trip",
      "subtitle": "Compare fares and travel with confidence",
      "description": "Longer content here"
    }
  }
}
```

### Output

- `Hero` tab
  - `Title` -> `StructuredText`
  - `Subtitle` -> `StructuredText`
  - `Description` -> `StructuredText`

### Why

The generator currently treats fields named:

- `title`
- `subtitle`
- `description`

as `StructuredText` unless they are SEO fields.

---

### Case 4: SEO-like simple text

### Input

```json
{
  "home_page": {
    "seo": {
      "title": "SEO title",
      "description": "SEO description"
    }
  }
}
```

### Output

- `Seo` tab
  - `Title` -> `Text`
  - `Description` -> `Text`

### Why

Paths starting with `seo.` are intentionally not converted to
`StructuredText`.

---

### Case 5: Array of objects -> Group

### Input

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

### Output

- `Main`
  - `Us Route` -> `Group`
    - `Code` -> `Text`
    - `Name` -> `Text`

### Why

An array of objects is treated as a Prismic `Group`.

The generator uses the first object in the array to define the group fields.

---

### Case 6: Main tab plus Group

### Input

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

### Output

- `Main`
  - `First Name` -> `Text`
  - `Last Name` -> `Text`
  - `Us Route` -> `Group`
    - `Code` -> `Text`
    - `Name` -> `Text`

---

### Case 7: Create a new tab intentionally

### Input

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name",
      "last_name": "Last name"
    }
  }
}
```

### Output

- `Personal Info` tab
  - `First Name` -> `Text`
  - `Last Name` -> `Text`

### Why

When the path shape becomes:

```txt
passenger.personal_info.first_name
```

the generator understands `personal_info` as a section and creates a tab.

---

### Case 8: Multiple tabs

### Input

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name",
      "last_name": "Last name"
    },
    "travel_info": {
      "us_route": [
        {
          "code": "NRT",
          "name": "Narita Airport"
        }
      ]
    },
    "documents": {
      "passport_number": "Passport number"
    }
  }
}
```

### Output

- `Personal Info` tab
  - `First Name` -> `Text`
  - `Last Name` -> `Text`

- `Travel Info` tab
  - `Us Route` -> `Group`
    - `Code` -> `Text`
    - `Name` -> `Text`

- `Documents` tab
  - `Passport Number` -> `Text`

---

### Case 9: Mixed Main and tabs

### Input

```json
{
  "passenger": {
    "status": "Active",
    "travel_info": {
      "us_route": [
        {
          "code": "NRT",
          "name": "Narita Airport"
        }
      ]
    }
  }
}
```

### Output

- `Main`
  - `Status` -> `Text`

- `Travel Info` tab
  - `Us Route` -> `Group`
    - `Code` -> `Text`
    - `Name` -> `Text`

### Why

Direct root fields stay in `Main`.
Nested section objects create tabs.

---

### Case 10: Page document with UID

### Input

```ts
{
  modelId: "home_page",
  modelType: "page",
  uid: "home",
  content: {
    hero: {
      title: "Welcome"
    }
  }
}
```

### Output

- `Main`
  - `UID` -> `UID`

- `Hero` tab
  - `Title` -> `StructuredText`

### Why

If `modelType === "page"`, the generator adds a `UID` field in `Main`.

## Tab generation rule

### Current rule

The tab logic is based on the flattened path.

Examples:

```txt
passenger.first_name
```

Result:

- `Main`

```txt
passenger.personal_info.first_name
```

Result:

- `Personal Info`

### Practical meaning

- direct field under document root -> `Main`
- nested object section -> new tab

## Group generation rule

### Current rule

If a field value is an array of objects, it becomes a `Group`.

Example:

```json
"us_route": [
  {
    "code": "NRT",
    "name": "Narita Airport"
  }
]
```

becomes:

- `Us Route` -> `Group`
  - `Code`
  - `Name`

## Important limitations

These are important so the team does not assume the generator supports more
than it currently does.

### 1. Array of objects is supported

Example:

```json
[
  { "code": "NRT", "name": "Narita Airport" }
]
```

Supported as `Group`.

### 2. Empty array is not useful for schema inference

Example:

```json
"us_route": []
```

Problem:

- the generator cannot infer the inner field structure from an empty array

Recommendation:

- provide one sample object while generating models

### 3. Array of strings is not modeled as Group

Example:

```json
"tags": ["student", "adult"]
```

Current behavior:

- not a proper structured Group case
- avoid this shape for generated custom types

Recommendation:

- use array of objects instead if Prismic grouping is needed

Example:

```json
"tags": [
  {
    "value": "student"
  }
]
```

### 4. Nested object inside Group item is not a strong case yet

Example:

```json
"us_route": [
  {
    "airport": {
      "code": "NRT"
    }
  }
]
```

Current recommendation:

- avoid deep nested objects inside group items
- keep group item fields flat if possible

Better:

```json
"us_route": [
  {
    "airport_code": "NRT"
  }
]
```

### 5. Array of arrays is not supported

Avoid:

```json
"data": [[1, 2], [3, 4]]
```

### 6. Relationship fields are not inferred from plain labels

If you need a content relationship field:

- do not expect plain JSON labels to generate it automatically
- model it explicitly in the custom type or generator logic

### 7. Field type inference is heuristic

The generator currently uses naming conventions for:

- `title`
- `subtitle`
- `description`
- `seo.*`

That means:

- some fields are inferred as `StructuredText`
- some are inferred as `Text`

If a field needs a special type outside these rules, the generator must be
extended.

## Recommended JSON design rules for this project

### Rule 1: Use root-level direct fields for `Main`

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

### Rule 2: Use nested objects only when you want tabs

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name"
    }
  }
}
```

### Rule 3: Use array of objects when you want `Group`

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

### Rule 4: Keep group item fields flat

Prefer:

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

### Rule 5: Provide one representative object in arrays

This helps the generator infer the group field structure correctly.

## Demo examples

### Demo A: Passenger simple

### Input

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

### Output

- Main
  - First Name
  - Last Name

### Demo B: Passenger with group

### Input

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

### Output

- Main
  - First Name
  - Last Name
  - Us Route
    - Code
    - Name

### Demo C: Passenger with tabs and group

### Input

```json
{
  "passenger": {
    "personal_info": {
      "first_name": "First name",
      "last_name": "Last name"
    },
    "travel_info": {
      "us_route": [
        {
          "code": "NRT",
          "name": "Narita Airport"
        }
      ]
    }
  }
}
```

### Output

- Personal Info tab
  - First Name
  - Last Name

- Travel Info tab
  - Us Route group
    - Code
    - Name

## Commands

Generate models:

```bash
pnpm prismic:models:generate
```

Validate generated models:

```bash
pnpm prismic:validate
```

Generate Prismic TypeScript types:

```bash
pnpm prismic:types:generate
```

## Checklist before sharing a new label structure

1. Does the root field belong in `Main` or a new tab?
2. Is any field an array of objects that should become a `Group`?
3. Are group item fields flat and easy to infer?
4. Are `title`, `subtitle`, and `description` intended to be rich text?
5. Did you update both `en.json` and `ja.json` if needed?
6. Did you register the new document in `prismic-document-registry.ts`?
7. Did `pnpm prismic:models:generate` succeed?
8. Did `pnpm prismic:validate` pass?

## Summary

The simplest way to think about the generator is:

- string -> `Text`
- title/subtitle/description -> `StructuredText`
- direct root field -> `Main`
- nested object section -> new tab
- array of objects -> `Group`

If you follow those rules while shaping the JSON, the generated Prismic custom
type will usually match the expected Slice Machine layout.
