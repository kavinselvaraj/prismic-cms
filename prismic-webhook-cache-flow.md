# Prismic Webhook and Cache Flow

## Purpose

This document explains how the current webhook and caching design works for label updates.

## Current cache layers

### 1. Server cache

The server caches Prismic label responses using Next.js `unstable_cache`.

Current cache tags:

- `ibe-labels`
- `ibe-labels:en`
- `ibe-labels:ja`

Relevant file:

- [apps/web/src/ibe/services/label-service.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/ibe/services/label-service.ts)

### 2. Browser cache

The browser stores label responses in `localStorage`.

Storage key:

```txt
ibe-labels:<locale>
```

Relevant file:

- [apps/web/src/i18n/use-label-messages.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/i18n/use-label-messages.ts)

## Current refresh model

### Browser side

1. show cached labels quickly if found
2. call `/api/labels/[locale]` in background
3. compare `version`
4. update localStorage and UI if changed

### Server side

1. keep Prismic results cached for normal requests
2. clear cache when webhook arrives

## Webhook endpoint

Route:

```txt
/api/revalidate/labels
```

Relevant file:

- [apps/web/src/app/api/revalidate/labels/route.ts](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/api/revalidate/labels/route.ts)

## Current webhook usage

### Local

Example:

```txt
https://your-ngrok-url/api/revalidate/labels?secret=your-secret
```

### What the route does

1. validate secret
2. inspect manual locale input or Prismic webhook payload
3. determine affected locales
4. revalidate server cache tags
5. next label API request fetches latest Prismic content

## Publish flow

```txt
Prismic publish
  -> webhook sent
  -> /api/revalidate/labels
  -> cache tags cleared
  -> next /api/labels/[locale] request fetches fresh content
  -> browser saves new version to localStorage
  -> UI updates
```

## Logs to verify webhook flow

### In Prismic

You should see:

- delivery status `200`

### In application terminal

You should see:

```txt
[labels-revalidate] success
```

And then on next label request:

```txt
[label-service] PRISMIC API HIT
```

### In browser console

You should see:

```txt
[labels-cache] API RESPONSE
```

with:

- `hasLabelChanges: true`

## Current production note

The current local flow supports query-string secret for convenience.

That is fine for local testing, but production should move to:

- header-only secret handling
- stricter webhook verification

See:

- [prismic-webhook-production-note.md](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/prismic-webhook-production-note.md)
