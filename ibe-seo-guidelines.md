# IBE SEO Guidelines

## Purpose

This document defines the SEO rule for IBE workflow pages versus content pages.

## Core rule

Not every page in the application should be indexed.

For this project, split pages into two groups:

### 1. Indexable pages

These are content-driven pages intended for SEO:

- landing pages
- destination pages
- route pages
- help / FAQ pages
- policy pages
- Prismic static content pages

### 2. Non-indexable transactional pages

These are workflow pages and should not be indexed:

- flight search
- flight selection
- passenger
- payment
- review
- booking confirmation

## Current implementation

The following pages are now marked as:

```txt
robots: noindex, follow
```

- [apps/web/src/app/[locale]/flight-search/page.tsx](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/%5Blocale%5D/flight-search/page.tsx)
- [apps/web/src/app/[locale]/flight-select/page.tsx](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/%5Blocale%5D/flight-select/page.tsx)
- [apps/web/src/app/[locale]/passenger/page.tsx](C:/Users/KAVINKUMAR/OneDrive/Documents/API-Next%20JS/apps/web/src/app/%5Blocale%5D/passenger/page.tsx)

## Why transaction pages should be `noindex`

### Flight search

- low-content page
- not intended to rank
- user workflow page

### Flight selection

- often based on dynamic search state
- can create many duplicate URL states
- should not become an SEO entry page

### Passenger / payment / review

- highly transactional
- not useful as search landing pages
- should stay out of search engine indexes

## Recommended metadata pattern

Use:

```ts
robots: {
  index: false,
  follow: true,
}
```

## Sitemap rule

Do not include transactional IBE pages in sitemap generation.

Only include:

- static content pages
- help pages
- destination/route SEO pages
- Prismic-authored public content pages

## Future SEO implementation plan

### For transactional pages

- `noindex, follow`
- exclude from sitemap

### For content pages

- SEO title
- SEO description
- canonical URL
- `hreflang`
- sitemap inclusion

## Summary

IBE workflow pages should prioritize:

- usability
- conversion
- performance

SEO should focus on:

- public content pages
- editorial landing pages
- route/destination content pages
