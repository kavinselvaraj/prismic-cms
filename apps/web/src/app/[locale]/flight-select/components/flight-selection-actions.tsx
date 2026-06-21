"use client";

import { useRouter } from "next/navigation";

type FlightSelectionActionsProps = {
  appABaseUrl: string;
  canRetry?: boolean;
  locale: string;
};

export function FlightSelectionActions({
  appABaseUrl,
  canRetry = false,
  locale,
}: FlightSelectionActionsProps) {
  const router = useRouter();
  const changeSearchHref = `${appABaseUrl}/${locale}/flight-search`;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {canRetry ? (
        <button
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => router.refresh()}
          type="button"
        >
          Retry
        </button>
      ) : null}
      <a
        className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900"
        href={changeSearchHref}
      >
        Change Search
      </a>
    </div>
  );
}
