import { FlightSelectionActions } from "./flight-selection-actions";

type NoFlightsFoundProps = {
  appABaseUrl: string;
  locale: string;
};

export function NoFlightsFound({
  appABaseUrl,
  locale,
}: NoFlightsFoundProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-950">No Flights Found</h1>
        <p className="mt-3 text-sm text-slate-700">
          The search completed successfully, but no flights were returned for the
          selected criteria.
        </p>
        <FlightSelectionActions
          appABaseUrl={appABaseUrl}
          locale={locale}
        />
      </div>
    </section>
  );
}
