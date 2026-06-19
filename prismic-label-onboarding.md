# Prismic Label Onboarding

This guide explains what to do when a developer adds new labels to
`apps/web/messages/en.json` and those labels need to be moved into Prismic.

## Example

Suppose a developer adds a new section for passenger labels:

```json
{
  "passenger": {
    "first_name": "First name",
    "last_name": "Last name"
  }
}
```

## Step-by-step process

1. Add the new labels in `apps/web/messages/en.json`

   Example:

   ```json
   {
     "passenger": {
       "first_name": "First name",
       "last_name": "Last name"
     }
   }
   ```

2. Add the matching labels in `apps/web/messages/ja.json` if Japanese support is required.

3. Open `apps/web/src/i18n/prismic-document-registry.ts`.

4. Add a new document function for the new label group.

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

5. Register the new document inside `getPrismicDocuments(locale)`.

   Example:

   ```ts
   export function getPrismicDocuments(locale: AppLocale = "en") {
     return [
       getFlightSearchDocument(locale),
       getFlightSelectDocument(locale),
       getPassengerDocument(locale),
     ] satisfies PrismicLabelDocument[];
   }
   ```

6. Generate the Prismic custom type JSON.

   Run:

   ```bash
   pnpm prismic:models:generate
   ```

7. Validate the generated model.

   Run:

   ```bash
   pnpm prismic:validate
   ```

8. Check the generated custom type under:

   ```txt
   apps/prismic-app/customtypes/passenger/index.json
   ```

9. Start the Prismic app and Slice Machine.

   Run:

   ```bash
   pnpm dev:prismic
   pnpm slicemachine
   ```

10. Review the new custom type in Slice Machine.

11. Push or sync the custom type to the Prismic repository.

12. Create the content document in Prismic and fill the values manually, or use seed commands.

13. If you want to seed content from local JSON, run:

   Dry run:

   ```bash
   pnpm prismic:seed:dry
   ```

   Write:

   ```bash
   pnpm prismic:seed
   ```

14. If the project uses a parent `ibe` document, link the new child document there.

   Example:
   - create a content relationship field in `ibe`
   - link the `passenger` document from the `ibe` content entry

15. Update the runtime label resolution only if the UI needs to read the new Prismic child document directly.

## Developer responsibility split

- Web team:
  - adds labels in `en.json` and `ja.json`
  - uses local labels during development

- Prismic team:
  - registers the new document in `prismic-document-registry.ts`
  - generates the custom type
  - validates and syncs it to Prismic
  - seeds or configures content

## Quick checklist

```txt
1. Add labels in en.json
2. Add labels in ja.json
3. Add document in prismic-document-registry.ts
4. Register it in getPrismicDocuments()
5. Run pnpm prismic:models:generate
6. Run pnpm prismic:validate
7. Sync custom type in Slice Machine
8. Create or seed Prismic content
9. Link it under ibe if required
```
