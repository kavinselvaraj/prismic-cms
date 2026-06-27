"use client";

import { useEffect, useMemo, useState } from "react";
import { createSdkClientContext } from "@repo/sdk";
import { ErrorScenariosApi } from "@/lib/error-scenarios-api";
import { getAppApiError } from "@/lib/api-errors";

const ERROR_STATUSES = [401, 403, 404, 500, 501, 502, 503] as const;

type ErrorStatus = (typeof ERROR_STATUSES)[number];

type DemoResult = {
  message: string;
  status: ErrorStatus;
  title: string;
  timestamp: string;
};

export function SdkErrorScenariosDemo() {
  const [sdkReady, setSdkReady] = useState(false);
  const [results, setResults] = useState<DemoResult[]>([]);
  const [activeStatus, setActiveStatus] = useState<ErrorStatus | "all" | null>(
    null,
  );

  const sdkContext = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return createSdkClientContext({
      baseUrl: window.location.origin,
      onUnauthorized: () => undefined,
    });
  }, []);

  const errorApi = useMemo(() => {
    if (!sdkContext) {
      return null;
    }

    return sdkContext.getApi(ErrorScenariosApi);
  }, [sdkContext]);

  useEffect(() => {
    setSdkReady(Boolean(errorApi));
  }, [errorApi]);

  async function runScenario(status: ErrorStatus) {
    if (!errorApi) {
      return;
    }

    setActiveStatus(status);

    try {
      await errorApi.simulateErrorScenario({ status });
    } catch (error) {
      const nextResult = formatScenarioResult(status, error);
      setResults((current) => [nextResult, ...current].slice(0, 10));
    } finally {
      setActiveStatus(null);
    }
  }

  async function runAllScenarios() {
    if (!errorApi) {
      return;
    }

    setActiveStatus("all");

    for (const status of ERROR_STATUSES) {
      try {
        await errorApi.simulateErrorScenario({ status });
      } catch (error) {
        const nextResult = formatScenarioResult(status, error);
        setResults((current) => [nextResult, ...current].slice(0, 10));
      }
    }

    setActiveStatus(null);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          SDK error demo
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Centralized fetch error handling
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          This demo runs the same SDK wrapper against a local status-code
          endpoint so we can inspect 401, 403, 404, 500, 501, 502, and 503
          responses in one place.
        </p>
      </section>

      <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Scenario controls
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Status demo endpoint: <code>/api/error-demo/[status]</code>
            </p>
          </div>
          <button
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!sdkReady || activeStatus !== null}
            onClick={() => void runAllScenarios()}
            type="button"
          >
            {activeStatus === "all" ? "Running all..." : "Run all scenarios"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {ERROR_STATUSES.map((status) => (
            <button
              key={status}
              className="border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!sdkReady || activeStatus !== null}
              onClick={() => void runScenario(status)}
              type="button"
            >
              {activeStatus === status ? `Running ${status}...` : status}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            Latest error responses
          </h2>
          <span className="text-sm text-slate-600">
            {results.length} recorded result{results.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {results.length ? (
            results.map((result) => (
              <article
                key={`${result.status}-${result.timestamp}`}
                className="border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-rose-700">
                      {result.status} {result.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {result.message}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {result.timestamp}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">
              No errors recorded yet. Run a scenario above to populate the log.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function formatScenarioResult(
  status: ErrorStatus,
  error: unknown,
): DemoResult {
  const appError = getAppApiError(error);
  return {
    message: `${appError.code}: ${appError.message}`,
    status: (appError.status ?? status) as ErrorStatus,
    title: statusTitle(status),
    timestamp: new Date().toLocaleTimeString(),
  };
}

function statusTitle(status: ErrorStatus): string {
  switch (status) {
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    case 501:
      return "Not Implemented";
    case 502:
      return "Bad Gateway";
    case 503:
      return "Service Unavailable";
  }
}
