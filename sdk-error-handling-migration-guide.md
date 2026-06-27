# SDK And Error Handling Migration Guide

This guide explains which files to copy into the new repo and which files are only for this demo app.

## Recommended Architecture

Keep the responsibilities separated:

- `packages/sdk`: generated OpenAPI client plus generic SDK wrapper.
- `apps/web`: app-specific token lifecycle, logout behavior, error UI, route boundaries, and demos.
- Generated `swagger` code should be recreated from the target repo's OpenAPI spec, not manually edited.

## Must Copy To `packages/sdk`

Copy these files into the new repo's SDK package:

```txt
packages/sdk/package.json
packages/sdk/index.ts
packages/sdk/sdk-client.ts
packages/sdk/openapi-generator-config.json
packages/sdk/openapitools.json
packages/sdk/biome.json
packages/sdk/tsconfig.json
```

Copy your target API spec into the SDK package:

```txt
packages/sdk/swagger.yml
```

Then regenerate the SDK:

```bash
pnpm --filter @repo/sdk sdk:refresh
```

The generated folder should be:

```txt
packages/sdk/swagger/
```

Do not manually maintain generated files inside `packages/sdk/swagger`. Regenerate them from `swagger.yml`.

## SDK Package Scripts

The SDK package should keep these scripts:

```json
{
  "scripts": {
    "sdk:clean": "node -e \"require('node:fs').rmSync('./swagger', { recursive: true, force: true })\"",
    "sdk:generate": "openapi-generator-cli generate -i ./swagger.yml -g typescript-fetch -o ./swagger -c ./openapi-generator-config.json",
    "sdk:refresh": "pnpm run sdk:clean && pnpm run sdk:generate",
    "openapi:generate": "pnpm run sdk:generate",
    "lint": "biome check .",
    "typecheck": "tsc --noEmit"
  }
}
```

Use `typescript-fetch` for the airline booking app. It is fine to continue with fetch. The wrapper in `sdk-client.ts` gives the missing enterprise features: common headers, timeout, token injection, error normalization, and optional 401 callback.

## Must Copy To `apps/web`

Copy these shared application error files:

```txt
apps/web/src/lib/api-errors.ts
apps/web/src/components/app-error-fallback.tsx
apps/web/src/app/error.tsx
apps/web/src/app/global-error.tsx
apps/web/src/app/[locale]/error.tsx
```

These files provide centralized application error mapping and route-level fallback UI.

## Token Handling Files

Copy these if your app uses the same security-token cookie flow:

```txt
apps/web/src/security/security-token.ts
apps/web/src/security/security-token.server.ts
apps/web/src/security/security-token.client.ts
apps/web/src/app/api/security-token/route.ts
apps/web/src/middleware.ts
```

### How The Token Flow Works

1. Middleware checks whether the security-token cookie exists.
2. If the cookie is missing or expired, middleware calls the SDK-generated `SecurityTokenApi`.
3. `SecurityTokenApi` calls `/api/security-token`.
4. `/api/security-token` sets the security-token cookie.
5. Server services read the cookie using `getAuthorizedSdkClientContextForRequest`.
6. SDK calls automatically send the token as `x-security-token`.
7. Browser SDK calls can pass `onUnauthorized: handleUnauthorizedSdkResponse`.
8. On `401`, the app clears the token cookie and redirects the user.

## Environment Variables

Add these to the target app:

```env
BACKEND_API_BASE_URL=https://your-api.example.com
NEXT_PUBLIC_JSONPLACEHOLDER_BASE_URL=https://jsonplaceholder.typicode.com
```

For the real airline app, replace demo variables with your actual public browser API base URL if CSR calls need one.

Example:

```env
BACKEND_API_BASE_URL=https://booking-api.example.com
NEXT_PUBLIC_BOOKING_API_BASE_URL=https://booking-api.example.com
```

## Server-Side API Usage

Use this pattern inside server services:

```ts
import { UsersApi } from "@repo/sdk";
import { getAuthorizedSdkClientContextForRequest } from "@/security/security-token.server";

export async function getUsers() {
  const context = await getAuthorizedSdkClientContextForRequest();
  const usersApi = context.getApi(UsersApi);

  return usersApi.listUsers();
}
```

If this call receives `500`, `502`, or `503`, the SDK throws `SdkRequestError`. The nearest Next.js `error.tsx` catches it and renders `AppErrorFallback`.

## Client-Side API Usage

Use this pattern inside client components:

```ts
"use client";

import { UsersApi, createSdkClientContext } from "@repo/sdk";
import { handleUnauthorizedSdkResponse } from "@/security/security-token.client";

const context = createSdkClientContext({
  baseUrl: process.env.NEXT_PUBLIC_BOOKING_API_BASE_URL,
  onUnauthorized: handleUnauthorizedSdkResponse,
});

const usersApi = context.getApi(UsersApi);
```

For CSR:

- Common headers are added inside SDK.
- Timeout is handled inside SDK.
- Non-2xx responses become `SdkRequestError`.
- `401` can trigger app-level logout using `onUnauthorized`.
- UI should use `getAppApiError(error)` or `AppErrorFallback`.

## Demo Files

Copy these only if you want the same demo pages in the new repo:

```txt
apps/web/src/components/sdk-csr-demo.tsx
apps/web/src/components/sdk-error-scenarios-demo.tsx
apps/web/src/lib/error-scenarios-api.ts
apps/web/src/app/api/error-demo/[status]/route.ts
apps/web/src/app/[locale]/sdk-csr-demo/page.tsx
apps/web/src/app/[locale]/sdk-error-scenarios/page.tsx
```

These are not required for production. They are useful for testing `401`, `403`, `404`, `500`, `501`, `502`, and `503`.

## Do Not Copy As Production Code

Do not copy these as-is into the real app unless they match your actual API:

```txt
packages/sdk/swagger/
packages/sdk/swagger.yml
apps/web/src/services/jsonplaceholder/
apps/web/src/app/[locale]/jsonplaceholder/
```

In the new repo:

1. Replace `swagger.yml` with your real airline API spec.
2. Run `pnpm --filter @repo/sdk sdk:refresh`.
3. Replace demo APIs like `PostsApi`, `UsersApi`, and `AlbumsApi` with your real generated APIs.

## Production Checklist

- Keep `packages/sdk/sdk-client.ts` generic.
- Do not put redirects, logout, cookies, or Next.js imports inside `packages/sdk`.
- Keep token creation and cookie clearing inside the web app.
- Keep `401` logout behavior in `apps/web/src/security/security-token.client.ts`.
- Keep API error mapping in `apps/web/src/lib/api-errors.ts`.
- Keep shared UI fallback in `apps/web/src/components/app-error-fallback.tsx`.
- Add one shared `error.tsx` at the route segment level instead of duplicating error handling in every page.
- Regenerate `packages/sdk/swagger` whenever the OpenAPI contract changes.

## Validation Commands

Run these after copying:

```bash
pnpm --filter @repo/sdk typecheck
pnpm --filter web typecheck
pnpm --filter @repo/sdk lint
pnpm --filter web lint
```

## Minimum Copy Set

If you want only the clean production foundation, copy this minimum set:

```txt
packages/sdk/package.json
packages/sdk/index.ts
packages/sdk/sdk-client.ts
packages/sdk/openapi-generator-config.json
packages/sdk/openapitools.json
packages/sdk/swagger.yml

apps/web/src/lib/api-errors.ts
apps/web/src/components/app-error-fallback.tsx
apps/web/src/app/error.tsx
apps/web/src/app/global-error.tsx
apps/web/src/app/[locale]/error.tsx
apps/web/src/security/security-token.ts
apps/web/src/security/security-token.server.ts
apps/web/src/security/security-token.client.ts
apps/web/src/app/api/security-token/route.ts
apps/web/src/middleware.ts
```

Then regenerate:

```bash
pnpm --filter @repo/sdk sdk:refresh
```
