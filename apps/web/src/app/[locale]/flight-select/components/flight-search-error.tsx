import { FlightSelectionActions } from "./flight-selection-actions";

type FlightSearchErrorProps = {
  appABaseUrl: string;
  locale: string;
  message: string;
};

export function FlightSearchError({
  appABaseUrl,
  locale,
  message,
}: FlightSearchErrorProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-2xl font-semibold text-slate-950">
          Unable to Load Flight Results
        </h1>
        <p className="mt-3 text-sm text-slate-700">{message}</p>
        <FlightSelectionActions
          appABaseUrl={appABaseUrl}
          canRetry
          locale={locale}
        />
      </div>
    </section>
  );
}
