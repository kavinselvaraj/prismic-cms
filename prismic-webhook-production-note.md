# Prismic Webhook Production Hardening Note

## Current state

The local webhook setup is intentionally simple so it works with `ngrok` and local development:

- URL may include `?secret=...`
- route accepts the secret from:
  - request header
  - request body
  - query string

This is acceptable for local testing, but it should not be the final production design.

## Why it should change for production

Query-string secrets are easier to leak through:

- browser history
- reverse proxy logs
- monitoring tools
- screenshots or copied URLs

The current implementation also uses a shared-secret equality check only. That is enough for a controlled internal setup, but it is not the strongest production posture.

## Recommended production target

### 1. Remove secret from webhook URL

Do not use:

```txt
https://your-domain.com/api/revalidate/labels?secret=...
```

Use:

```txt
https://your-domain.com/api/revalidate/labels
```

### 2. Use header-only secret validation

Accept the secret only from a request header sent by Prismic.

Example:

- `x-prismic-signature`
- or a dedicated internal header such as `x-revalidate-secret`

### 3. Keep secret only in environment variables

Example:

```env
PRISMIC_WEBHOOK_SECRET=your-production-secret
```

or

```env
LABEL_REVALIDATE_SECRET=your-production-secret
```

### 4. Restrict logging

Do not log:

- full webhook URL
- secret values
- full request headers

Log only:

- request accepted/rejected
- affected locales
- changed document IDs

### 5. Review Prismic webhook capabilities

If Prismic supports signed webhook verification beyond a plain shared secret, prefer that over a simple equality check.

## Suggested rollout plan

### Local

- keep current query-string-based approach for `ngrok`
- use simple shared secret

### QA / UAT

- move to header-only secret
- remove query-string secret support

### Production

- header-only validation
- least-privilege logging
- optional signed verification if supported

## Ownership

This change is best handled when production environment and deployment topology are finalized, because the final design depends on:

- hosting platform
- ingress / reverse proxy
- log retention policy
- security review requirements
