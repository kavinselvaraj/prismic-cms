# Prismic Translation Flow

## Purpose

This document explains the end-to-end label translation flow in the current application, starting from the landing page request and ending with Prismic-rendered labels in the UI.

This flow is for the current implementation where:

- labels can come from local JSON or Prismic
- `LABEL_SOURCE` controls the source
- browser cache uses `localStorage`
- server cache uses Next.js `unstable_cache`
- Prismic webhook clears server cache

## Applications involved

- `apps/web`
  - renders the UI
  - exposes `/api/labels/[locale]`
  - exposes `/api/revalidate/labels`
- `packages/cms`
  - provides shared Prismic client and env helpers
- `apps/prismic-app`
  - manages custom types
  - seeds Prismic content

## High-level flow

```txt
Browser
  -> Landing page
  -> Label component
  -> Browser localStorage check
  -> /api/labels/[locale]
  -> web label service
  -> packages/cms Prismic client
  -> Prismic content API
  -> mapped labels returned
  -> browser localStorage updated
  -> UI re-renders with latest labels
```

## Step-by-step flow

### Step 1. User opens the landing page

Example:

```txt
http://localhost:3000/en
```

If your local app runs on another port, replace `3000` with that port.

Relevant file:

- [apps/web/src/app/[locale]/page.tsx](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/%5Blocale%5D/page.tsx)

This page renders:

- `LocalizedLabels`

## Step 2. The UI component asks for labels

Relevant file:

- [apps/web/src/components/localized-labels.tsx](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/components/localized-labels.tsx)

This component calls:

- `useLabelMessages(locale)`

Relevant file:

- [apps/web/src/i18n/use-label-messages.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/i18n/use-label-messages.ts)

## Step 3. Browser checks localStorage first

The hook checks this key:

```txt
ibe-labels:<locale>
```

Examples:

```txt
ibe-labels:en
ibe-labels:ja
```

If found:

- labels are shown immediately
- then the browser still calls `/api/labels/[locale]` in the background

If not found:

- browser calls `/api/labels/[locale]` immediately

## Step 4. Browser calls the labels API

Example:

```txt
/api/labels/en
```

Relevant file:

- [apps/web/src/app/api/labels/[locale]/route.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/api/labels/%5Blocale%5D/route.ts)

The API route:

1. resolves the locale
2. reads the configured label source
3. calls `getIbeLabels(resolvedLocale)`
4. returns:
   - `locale`
   - `messages`
   - `source`
   - `version`

## Step 5. Server decides local or Prismic

Relevant file:

- [apps/web/src/ibe/services/label-service.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/ibe/services/label-service.ts)

The decision is based on:

```env
LABEL_SOURCE=local
```

or

```env
LABEL_SOURCE=prismic
```

### If `LABEL_SOURCE=local`

The server returns values from:

- [apps/web/messages/en.json](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/messages/en.json)
- [apps/web/messages/ja.json](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/messages/ja.json)

### If `LABEL_SOURCE=prismic`

The server fetches Prismic content.

## Step 6. Server uses shared CMS Prismic client

Relevant files:

- [packages/cms/src/prismic/create-client.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/packages/cms/src/prismic/create-client.ts)
- [packages/cms/src/prismic/config.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/packages/cms/src/prismic/config.ts)

The client reads:

- `PRISMIC_REPOSITORY_NAME`
- `PRISMIC_ACCESS_TOKEN`

## Step 7. Server reads the parent `ibe` document

Current label orchestration uses:

- parent document: `ibe`
- child documents:
  - `flight_search`
  - `flight_select`
  - `passenger`

The service:

1. fetches `ibe`
2. finds linked child document IDs
3. fetches all child documents with `getAllByIDs`

This reduces API count compared with fetching each child individually.

## Step 8. Server maps Prismic data to the common label contract

Relevant files:

- [apps/web/src/ibe/utils/resolve-prismic-labels.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/ibe/utils/resolve-prismic-labels.ts)
- [apps/web/src/i18n/messages.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/i18n/messages.ts)

Important detail:

- The runtime no longer depends only on `en.json`
- A common label contract is created from all available locale message files
- Prismic values are mapped into that shared shape

This helps avoid one-language-only assumptions.

## Step 9. Server returns a label version

Relevant file:

- [apps/web/src/i18n/label-version.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/i18n/label-version.ts)

The API returns a `version` hash based on the final label payload.

The browser uses this to decide whether labels changed.

## Step 10. Browser updates localStorage and UI

Relevant file:

- [apps/web/src/i18n/use-label-messages.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/i18n/use-label-messages.ts)

The browser:

1. receives API response
2. compares `cachedResponse.version` with `payload.version`
3. updates `localStorage`
4. updates UI if version changed

## Cache layers

### Browser cache

- `localStorage`
- key: `ibe-labels:<locale>`

### Server cache

- `unstable_cache`
- cache tags:
  - `ibe-labels`
  - `ibe-labels:en`
  - `ibe-labels:ja`

## Webhook flow

When a Prismic document is published:

1. Prismic webhook calls `/api/revalidate/labels`
2. the route checks the secret
3. relevant cache tags are revalidated
4. next browser request to `/api/labels/[locale]` fetches fresh Prismic content
5. browser updates `localStorage`
6. UI shows new labels

Relevant file:

- [apps/web/src/app/api/revalidate/labels/route.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/api/revalidate/labels/route.ts)

## Example test sequence

### Local mode

```env
LABEL_SOURCE=local
```

Result:

- UI always uses local message files

### Prismic mode

```env
LABEL_SOURCE=prismic
```

Result:

- labels API pulls from Prismic
- browser caches by locale
- webhook refreshes the server cache

## Logs to watch

### Browser console

```txt
[labels-cache] localStorage HIT
[labels-cache] FETCH /api/labels
[labels-cache] API RESPONSE
[labels-cache] SAVED localStorage
```

### App terminal

```txt
[labels-api] request
[label-service] PRISMIC API HIT
[label-service] IBE PARENT RESPONSE
[label-service] IBE CHILD DOCS RESOLVED
[label-service] MAPPED LABELS
```

### Webhook terminal logs

```txt
[labels-revalidate] success
```

## Summary

The current label translation flow is:

1. page renders
2. browser reads localStorage
3. browser calls `/api/labels/[locale]`
4. server resolves local or Prismic source
5. server fetches and maps labels
6. server returns labels plus version
7. browser updates cache and UI
8. webhook clears server cache after Prismic publish
