# IBE App

Next.js application following the NEXUZ-UI app structure.

## Backend API Skeleton

- `api-client/axios.ts` exports the server-side backend Axios instance.
- `api-client/endpoints.ts` keeps backend paths in one place.
- `api-client/url-mock-mapper.ts` maps backend URLs to mock responses.
- `api-client/query-client.ts` configures React Query.
- `modules/route-search` contains route-search client services, server services, and Redux store code.
- `app/[locale]/api` contains Next.js route handlers. Services call the same Axios client for mock and backend mode.

## Switching API Sources

Use mock data while backend work is pending:

```bash
API_SOURCE=mock
```

Switch to the real backend without changing components or route handlers:

```bash
API_SOURCE=backend
BACKEND_API_BASE_URL=https://jsonplaceholder.typicode.com
BACKEND_API_TOKEN=
```

For the temporary JSONPlaceholder backend, route search calls `/posts` and maps
the returned posts into the app's `SearchRoute` shape.

After changing env values, restart the Next.js dev server.
