# IBE App API Flow

This document explains how API calls should flow in the `ibe-app` structure.

## Main Rule

```txt
Component does not call backend directly.

Component calls Redux.
Redux calls client service.
Client service calls Next.js API route.
Next.js API route calls server service.
Server service calls Backend.
Redux stores the final response.
UI reads from Redux.
```

## Project Structure

```txt
apps/
  ibe-app/
    api-client/
      axios.ts
      api-endpoints.ts
      endpoints.ts
      query-client.ts
      interceptors/
        api-error.interceptor.ts

    app/
      layout.tsx
      page.tsx
      providers.tsx
      [locale]/
        layout.tsx
        page.tsx
        api/
          search/
            routes/
              route.ts
            routes-direct/

    components/
      sample-api-panel.tsx
      flight-selection/

    mock/
      search-routes.mock.ts

    modules/
      services/
        route-search.client.service.ts
        search-routes.service.ts
      utils/
        common/
        helpers/
        validations/

    store/
      hooks.ts
      index.ts
      slices/
        search-routes.slice.ts
        common/

    types/
      search-routes.ts
```

## High-Level Flow

```txt
User clicks button
  |
  v
React Component
  |
  v
Redux Thunk
  |
  v
Client Service
  |
  v
Next.js API Route
  |
  v
Server Service
  |
  v
Backend API
  |
  v
Redux Store
  |
  v
UI
```

## 1. Component Calls Redux

File:

```txt
components/sample-api-panel.tsx
```

Pseudo-code:

```tsx
"use client";

import { sampleSearchRoutesRequest } from "@/mock/search-routes.mock";
import { fetchSearchRoutes } from "@/store/slices/search-routes.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function SampleApiPanel({ locale }: { locale: string }) {
  const dispatch = useAppDispatch();

  const { routes, error, isPending } = useAppSelector(
    (state) => state.searchRoutes,
  );

  function callSearchRoutes() {
    dispatch(
      fetchSearchRoutes({
        locale,
        request: sampleSearchRoutesRequest,
      }),
    );
  }

  return (
    <>
      <button disabled={isPending} onClick={callSearchRoutes} type="button">
        {isPending ? "Calling..." : "Call API"}
      </button>

      <pre>{JSON.stringify(routes ?? error, null, 2)}</pre>
    </>
  );
}
```

Responsibility:

```txt
Component only handles UI events and reads Redux state.
Component should not call backend directly.
```

## 2. Redux Slice Calls Client Service

File:

```txt
store/slices/search-routes.slice.ts
```

Pseudo-code:

```ts
import { searchRoutesClientService } from "@/modules/services/route-search.client.service";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type FetchSearchRoutesArgs = {
  locale: string;
  request: SearchRoutesRequest;
};

type SearchRoutesState = {
  request?: SearchRoutesRequest;
  routes?: SearchRoute[];
  error?: string;
  isPending: boolean;
};

const initialState: SearchRoutesState = {
  isPending: false,
};

export const fetchSearchRoutes = createAsyncThunk<
  SearchRoute[],
  FetchSearchRoutesArgs,
  { rejectValue: string }
>("searchRoutes/fetch", async ({ locale, request }, thunkApi) => {
  try {
    return await searchRoutesClientService({
      locale,
      request,
    });
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Unable to search routes",
    );
  }
});

const searchRoutesSlice = createSlice({
  name: "searchRoutes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchRoutes.pending, (state, action) => {
        state.request = action.meta.arg.request;
        state.routes = undefined;
        state.error = undefined;
        state.isPending = true;
      })
      .addCase(fetchSearchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload;
        state.isPending = false;
      })
      .addCase(fetchSearchRoutes.rejected, (state, action) => {
        state.routes = undefined;
        state.error =
          action.payload ?? action.error.message ?? "Unable to search routes";
        state.isPending = false;
      });
  },
});

export default searchRoutesSlice.reducer;
```

Responsibility:

```txt
Redux manages API state:
- request
- routes
- error
- loading status
```

## 3. Client Service Calls Next.js API Route

File:

```txt
modules/services/route-search.client.service.ts
```

Pseudo-code:

```ts
import { apiEndpoints } from "@/api-client/api-endpoints";
import { apiClient } from "@/api-client/axios";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";

type SearchRoutesResponse = {
  data: SearchRoute[];
};

export async function searchRoutesClientService(params: {
  locale: string;
  request: SearchRoutesRequest;
}) {
  const { locale, request } = params;

  const response = await apiClient.post<SearchRoutesResponse>(
    apiEndpoints.searchRoutes(locale),
    request,
  );

  return response.data.data;
}
```

Responsibility:

```txt
Client service calls internal Next.js API routes.
It does not call backend base URLs directly.
```

## 4. Frontend API Endpoint Helper

File:

```txt
api-client/api-endpoints.ts
```

Pseudo-code:

```ts
export const apiEndpoints = {
  searchRoutes: (locale: string) => `/${locale}/api/search/routes`,
};
```

Responsibility:

```txt
Keeps frontend route URLs in one place.
```

## 5. Axios Client Setup

File:

```txt
api-client/axios.ts
```

Pseudo-code:

```ts
import { applyApiErrorInterceptor } from "@/api-client/interceptors/api-error.interceptor";
import axios from "axios";

const backendBaseUrl =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const api = axios.create({
  baseURL: backendBaseUrl,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

applyApiErrorInterceptor(apiClient);
applyApiErrorInterceptor(api);
```

Responsibility:

```txt
apiClient:
  Used by client services to call Next.js API routes.

api:
  Used by server services to call backend APIs.
```

## 6. Axios Error Interceptor

File:

```txt
api-client/interceptors/api-error.interceptor.ts
```

Pseudo-code:

```ts
import type { AxiosError, AxiosInstance } from "axios";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export function applyApiErrorInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.error ??
        error.response?.data?.message ??
        error.message ??
        "Something went wrong";

      return Promise.reject(new Error(message));
    },
  );
}
```

Responsibility:

```txt
Converts backend/API errors into normal JavaScript Error objects.
This keeps service and Redux error handling simple.
```

## 7. Next.js API Route Calls Server Service

File:

```txt
app/[locale]/api/search/routes/route.ts
```

Pseudo-code:

```ts
import { searchRoutesServerService } from "@/modules/services/search-routes.service";
import type { SearchRoutesRequest } from "@/types/search-routes";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRoutesRequest;
    const routes = await searchRoutesServerService(body);

    return NextResponse.json({
      data: routes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to search routes",
      },
      { status: 502 },
    );
  }
}
```

Responsibility:

```txt
This is the BFF layer.
It protects backend URLs and tokens from the browser.
```

## 8. Server Service Calls Backend

File:

```txt
modules/services/search-routes.service.ts
```

Pseudo-code:

```ts
import { api } from "@/api-client/axios";
import { backendEndpoints } from "@/api-client/endpoints";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";

export async function searchRoutesServerService(
  payload: SearchRoutesRequest,
): Promise<SearchRoute[]> {
  const response = await api.get<SearchRoute[]>(
    backendEndpoints.searchRoutes,
  );

  return response.data;
}
```

Responsibility:

```txt
Server service calls real backend APIs.
Only server service should know backend endpoint details.
```

## 9. Backend Endpoint Config

File:

```txt
api-client/endpoints.ts
```

Pseudo-code:

```ts
export const backendEndpoints = {
  searchRoutes: "/posts",
};
```

Responsibility:

```txt
Keeps backend paths in one place.
For JSONPlaceholder, route search temporarily uses /posts.
```

## 10. Store Setup

File:

```txt
store/index.ts
```

Pseudo-code:

```ts
import searchRoutesReducer from "@/store/slices/search-routes.slice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    searchRoutes: searchRoutesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
```

## 11. Store Hooks

File:

```txt
store/hooks.ts
```

Pseudo-code:

```ts
"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## 12. Environment

File:

```txt
.env.local
```

Example:

```env
API_SOURCE=backend
BACKEND_API_BASE_URL=https://jsonplaceholder.typicode.com
BACKEND_API_TOKEN=
```

## Final Flow

```txt
User clicks "Call API"
  |
  v
components/sample-api-panel.tsx
  |
  v
store/slices/search-routes.slice.ts
  |
  v
modules/services/route-search.client.service.ts
  |
  v
app/[locale]/api/search/routes/route.ts
  |
  v
modules/services/search-routes.service.ts
  |
  v
https://jsonplaceholder.typicode.com/posts
  |
  v
Redux stores final SearchRoute[] response
  |
  v
UI reads routes from Redux
```

## Team Guidelines

```txt
Do:
- Keep backend URLs out of components.
- Keep API URLs in api-client files.
- Keep Redux state in store/slices.
- Keep backend calls in modules/services.
- Use Next.js API routes as the BFF layer.

Do not:
- Call BACKEND_API_BASE_URL directly from components.
- Repeat Axios headers in every API call.
- Store external backend response shapes directly in UI if mapping is needed.
```
