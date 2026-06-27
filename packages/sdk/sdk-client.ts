import {
  Configuration,
  type ConfigurationParameters,
  type HTTPHeaders,
  type Middleware,
} from "./swagger";

type AnyApiInstance = object;

export type SdkApiClass<TApi extends AnyApiInstance = AnyApiInstance> = new (
  configuration?: Configuration,
) => TApi;

export type SdkClientContext = {
  baseUrl: string;
  configuration: Configuration;
  getApi: <TApi extends AnyApiInstance>(ApiClass: SdkApiClass<TApi>) => TApi;
};

export type CreateSdkClientContextOptions = Omit<
  ConfigurationParameters,
  "basePath" | "headers"
> & {
  baseUrl?: string;
  headers?: HTTPHeaders;
  middleware?: Middleware[];
  onUnauthorized?: () => void | Promise<void>;
  timeoutMs?: number;
};

export class SdkRequestError extends Error {
  readonly name = "SdkRequestError";
  readonly cause: unknown;
  readonly method: string;
  readonly responseBody: string | null;
  readonly status: number | null;
  readonly url: string;

  constructor(options: {
    cause?: unknown;
    message: string;
    method: string;
    responseBody?: string | null;
    status?: number | null;
    url: string;
  }) {
    super(options.message);
    this.cause = options.cause;
    this.method = options.method;
    this.responseBody = options.responseBody ?? null;
    this.status = options.status ?? null;
    this.url = options.url;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function resolveBackendBaseUrl(
  env = (
    globalThis as {
      process?: {
        env?: Record<string, string | undefined>;
      };
    }
  ).process?.env?.BACKEND_API_BASE_URL,
): string {
  if (!env?.trim()) {
    throw new Error("BACKEND_API_BASE_URL is not configured");
  }

  return normalizeBaseUrl(env);
}

function readResponseBody(response: Response): Promise<string | null> {
  return response
    .clone()
    .text()
    .catch(() => null);
}

function mergeHeaders(
  ...headersList: Array<HTTPHeaders | undefined>
): HTTPHeaders {
  return headersList.reduce<HTTPHeaders>((accumulator, currentHeaders) => {
    if (!currentHeaders) {
      return accumulator;
    }

    for (const [key, value] of Object.entries(currentHeaders)) {
      if (value === undefined || value === null) {
        continue;
      }

      accumulator[key] = value;
    }

    return accumulator;
  }, {});
}

function createTimeoutFetch(
  fetchImpl: typeof fetch,
  timeoutMs: number,
): typeof fetch {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return fetchImpl;
  }

  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const controller = new AbortController();
    const originalSignal = init.signal;

    const onAbort = () => controller.abort(originalSignal?.reason);

    if (originalSignal) {
      if (originalSignal.aborted) {
        controller.abort(originalSignal.reason);
      } else {
        originalSignal.addEventListener("abort", onAbort, { once: true });
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      return await fetchImpl(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      globalThis.clearTimeout(timeoutId);
      if (originalSignal) {
        originalSignal.removeEventListener("abort", onAbort);
      }
    }
  };
}

function createRequestMiddleware(
  headers: HTTPHeaders,
): Middleware {
  return {
    pre: async ({ init, url }) => {
      const nextHeaders = mergeHeaders(init.headers as HTTPHeaders, headers);

      nextHeaders.Accept = nextHeaders.Accept ?? "application/json";

      return {
        url,
        init: {
          ...init,
          headers: nextHeaders,
        },
      };
    },
    onError: async ({ error, init, url, response }) => {
      const method = (init.method ?? "GET").toUpperCase();
      const responseBody = response ? await readResponseBody(response) : null;
      const message =
        error instanceof Error
          ? `SDK request failed for ${method} ${url}: ${error.message}`
          : `SDK request failed for ${method} ${url}`;

      throw new SdkRequestError({
        cause: error,
        message,
        method,
        responseBody,
        status: response?.status ?? null,
        url,
      });
    },
  };
}

function createErrorMiddleware(
  onUnauthorized?: () => void | Promise<void>,
): Middleware {
  return {
    post: async ({ init, response, url }) => {
      if (response.ok) {
        return response;
      }

      if (response.status === 401 && onUnauthorized) {
        await onUnauthorized();
      }

      const responseBody = await readResponseBody(response);
      const method = (init.method ?? "GET").toUpperCase();

      throw new SdkRequestError({
        message: `SDK request failed with status ${response.status} for ${method} ${url}`,
        method,
        responseBody,
        status: response.status,
        url,
      });
    },
  };
}

export function createSdkErrorInterceptor(
  onUnauthorized?: () => void | Promise<void>,
): Middleware {
  return createErrorMiddleware(onUnauthorized);
}

export function createSdkConfiguration(
  options: CreateSdkClientContextOptions = {},
): Configuration {
  const {
    baseUrl = resolveBackendBaseUrl(),
    headers,
    middleware,
    onUnauthorized,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchApi,
    ...configuration
  } = options;

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const nextHeaders = mergeHeaders({ Accept: "application/json" }, headers);

  return new Configuration({
    ...configuration,
    basePath: normalizedBaseUrl,
    fetchApi: createTimeoutFetch(
      fetchApi ?? globalThis.fetch.bind(globalThis),
      timeoutMs,
    ),
    headers: nextHeaders,
    middleware: [
      createRequestMiddleware(nextHeaders),
      createErrorMiddleware(onUnauthorized),
      ...(middleware ?? []),
    ],
  });
}

export function createAuthorizedSdkConfiguration(
  securityToken: string,
  options: CreateSdkClientContextOptions = {},
): Configuration {
  return createSdkConfiguration({
    ...options,
    headers: mergeHeaders(options.headers, {
      "Cache-Control": "no-store",
      "x-security-token": securityToken,
    }),
  });
}

export function createSdkClientContext(
  options: CreateSdkClientContextOptions = {},
): SdkClientContext {
  const configuration = createSdkConfiguration(options);
  return createSdkClientContextFromConfiguration(configuration);
}

export function createAuthorizedSdkClientContext(
  securityToken: string,
  options: CreateSdkClientContextOptions = {},
): SdkClientContext {
  const configuration = createAuthorizedSdkConfiguration(
    securityToken,
    options,
  );

  return createSdkClientContextFromConfiguration(configuration);
}

function createSdkClientContextFromConfiguration(
  configuration: Configuration,
): SdkClientContext {
  const apiInstances = new Map<SdkApiClass, AnyApiInstance>();

  return {
    baseUrl: configuration.basePath,
    configuration,
    getApi: <TApi extends AnyApiInstance>(
      ApiClass: SdkApiClass<TApi>,
    ): TApi => {
      const cachedApi = apiInstances.get(ApiClass);

      if (cachedApi) {
        return cachedApi as TApi;
      }

      const api = new ApiClass(configuration);
      apiInstances.set(ApiClass, api);
      return api;
    },
  };
}
