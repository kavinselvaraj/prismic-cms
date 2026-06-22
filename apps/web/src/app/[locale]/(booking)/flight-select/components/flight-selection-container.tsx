import type { FlightSearchRoute } from "@/ibe/services/flight-search.service";
import type { WebFlightSearchQuery } from "@/ibe/utils/flight-search-query";
import { FlightSelectionActions } from "./flight-selection-actions";

type FlightSelectionContainerProps = {
  appABaseUrl: string;
  locale: string;
  routes: FlightSearchRoute[];
  search: WebFlightSearchQuery;
};

export function FlightSelectionContainer({
  appABaseUrl,
  locale,
  routes,
  search,
}: FlightSelectionContainerProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          APP-B
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Flight Selection
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
          This page belongs to <code>web</code>. It reads URL search params and
          calls the one existing flight search API on page load.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Route
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {search.origin} to {search.destination}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Departure
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {search.departureDate}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Passengers
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {search.adults}A / {search.children}C / {search.infants}I
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Currency
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {search.currency}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {routes.map((route) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5"
            key={route.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {route.origin} to {route.destination}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {route.carrierCode} {route.flightNumber}
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {route.price.amount} {search.currency || route.price.currency}
              </div>
            </div>

            <dl className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Departure</dt>
                <dd className="mt-1">{route.departureDateTime}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Arrival</dt>
                <dd className="mt-1">{route.arrivalDateTime}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <FlightSelectionActions
        appABaseUrl={appABaseUrl}
        locale={locale}
      />
    </section>
  );
}
