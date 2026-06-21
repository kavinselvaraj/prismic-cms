import { FlightSelectionActions } from "./flight-selection-actions";

type InvalidSearchProps = {
  appABaseUrl: string;
  locale: string;
  message?: string;
};

export function InvalidSearch({
  appABaseUrl,
  locale,
  message = "The search parameters are incomplete or invalid.",
}: InvalidSearchProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-2xl font-semibold text-slate-950">Invalid Search</h1>
        <p className="mt-3 text-sm text-slate-700">{message}</p>
        <FlightSelectionActions
          appABaseUrl={appABaseUrl}
          locale={locale}
        />
      </div>
    </section>
  );
}
