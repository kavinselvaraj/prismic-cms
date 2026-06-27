"use client";

import { getAppApiError, isRetryableAppApiError } from "@/lib/api-errors";
import Link from "next/link";

type AppErrorFallbackProps = {
  error: unknown;
  homeHref?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
};

export function AppErrorFallback({
  error,
  homeHref,
  onRetry,
  retryLabel = "Try again",
  title = "Request failed",
}: AppErrorFallbackProps) {
  const appError = getAppApiError(error);

  return (
    <section className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{appError.message}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-rose-700">
        {appError.code}
        {isRetryableAppApiError(appError.status) ? " - Retryable" : ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {onRetry ? (
          <button
            className="border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-900"
            onClick={onRetry}
            type="button"
          >
            {retryLabel}
          </button>
        ) : null}

        {homeHref ? (
          <Link
            className="border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-900"
            href={homeHref}
          >
            Go home
          </Link>
        ) : null}
      </div>
    </section>
  );
}
