import {
  createStaticSinToUsaOffers,
  formatAirportLocalTime,
  getFlightSelectionTiming,
} from "@/ibe/utils/flight-departure-eligibility";

type FlightTimeOffsetDemoProps = {
  locale: string;
};

export function FlightTimeOffsetDemo({ locale }: FlightTimeOffsetDemoProps) {
  const offers = createStaticSinToUsaOffers();

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Flight selection rule demo
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          SIN to USA departure-time eligibility
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          The selection field is displayed only when the departure time is at
          least 48 hours from now. The comparison uses the API&apos;s{" "}
          <code>departureTimeOffset</code> instant, while each airport time is
          displayed in its local timezone.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {offers.map((offer) => {
          const timing = getFlightSelectionTiming(offer);

          return (
            <article
              className="border border-slate-200 bg-white p-6 shadow-sm"
              key={offer.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {offer.flightNumber}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    {offer.departureAirport} to {offer.arrivalAirport}
                  </h2>
                </div>
                <span
                  className={
                    timing.eligible
                      ? "border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800"
                      : "border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900"
                  }
                >
                  {timing.eligible
                    ? "Eligible for selection"
                    : "Not selectable yet"}
                </span>
              </div>

              <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-500">
                    Departure: SIN local time
                  </dt>
                  <dd className="mt-1 font-medium text-slate-950">
                    {formatAirportLocalTime(
                      offer.departureTimeOffset,
                      offer.departureTimeZone,
                      locale,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">
                    Arrival: USA local time
                  </dt>
                  <dd className="mt-1 font-medium text-slate-950">
                    {formatAirportLocalTime(
                      offer.arrivalTimeOffset,
                      offer.arrivalTimeZone,
                      locale,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">
                    Time until departure
                  </dt>
                  <dd className="mt-1 font-medium text-slate-950">
                    {timing.hoursUntilDeparture} hours
                  </dd>
                </div>
              </dl>

              {timing.eligible ? (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <label className="grid max-w-md gap-2 text-sm font-semibold text-slate-800">
                    Select this flight
                    <select className="border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950">
                      <option>Standard fare</option>
                      <option>Flex fare</option>
                    </select>
                  </label>
                </div>
              ) : (
                <p className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
                  The selection field is hidden because this flight departs in
                  less than 48 hours.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
