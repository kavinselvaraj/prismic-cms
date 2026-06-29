"use client";

import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mockFlights } from "../data/booking.mock";
import {
  selectCanAccessFlightSelection,
  selectFlightSearch,
  selectPassengerNames,
  selectSelectedOutboundFlight,
  selectSelectedReturnFlight,
} from "../store/booking.selectors";
import {
  initializePassengersFromSearch,
  setPassengerNames,
  setSelectedOutboundFlight,
  setSelectedReturnFlight,
} from "../store/booking.slice";
import type {
  PassengerName,
  SegmentType,
  SelectedFlight,
} from "../types/booking.types";
import { getFlightsBySegment, isRoundTrip } from "../utils/booking.helpers";
import { BookingRouteGuard } from "./booking-route-guard";
import { PassengerNameModal } from "./passenger-name-modal";

type FlightSelectionViewProps = {
  locale: AppLocale;
};

export function FlightSelectionView({ locale }: FlightSelectionViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const canAccess = useAppSelector(selectCanAccessFlightSelection);
  const search = useAppSelector(selectFlightSearch);
  const selectedOutboundFlight = useAppSelector(selectSelectedOutboundFlight);
  const selectedReturnFlight = useAppSelector(selectSelectedReturnFlight);
  const passengerNames = useAppSelector(selectPassengerNames);
  const [error, setError] = useState<string | null>(null);
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);

  const outboundFlights = useMemo(
    () => getFlightsBySegment(mockFlights, "OUTBOUND"),
    [],
  );
  const returnFlights = useMemo(
    () => getFlightsBySegment(mockFlights, "RETURN"),
    [],
  );
  const roundTrip = isRoundTrip(search);

  function handleNext() {
    if (!selectedOutboundFlight) {
      setError("Select an outbound flight to continue.");
      return;
    }

    if (roundTrip && !selectedReturnFlight) {
      setError("Select a return flight to continue.");
      return;
    }

    setError(null);
    if (passengerNames.length === 0 && search) {
      dispatch(initializePassengersFromSearch(search));
    }
    setIsPassengerModalOpen(true);
  }

  function savePassengerNames(passengers: PassengerName[]) {
    dispatch(setPassengerNames(passengers));
    setIsPassengerModalOpen(false);
    router.push(`/${locale}/package-selection`);
  }

  return (
    <BookingRouteGuard
      isAllowed={canAccess}
      redirectTo={`/${locale}/flight-search`}
    >
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Flight selection
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            Select flights
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Back returns to search. Next validates selected flights, then opens
            the passenger name modal.
          </p>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <FlightList
            flights={outboundFlights}
            onSelect={(flight) => dispatch(setSelectedOutboundFlight(flight))}
            selectedFlightId={selectedOutboundFlight?.flightId ?? null}
            title="Outbound flights"
          />
          {roundTrip ? (
            <FlightList
              flights={returnFlights}
              onSelect={(flight) => dispatch(setSelectedReturnFlight(flight))}
              selectedFlightId={selectedReturnFlight?.flightId ?? null}
              title="Return flights"
            />
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
            onClick={() => router.push(`/${locale}/flight-search`)}
            type="button"
          >
            Back
          </button>
          <button
            className="bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
            onClick={handleNext}
            type="button"
          >
            Next
          </button>
        </div>

        <PassengerNameModal
          isOpen={isPassengerModalOpen}
          onClose={() => setIsPassengerModalOpen(false)}
          onSubmit={savePassengerNames}
          passengers={passengerNames}
        />
      </main>
    </BookingRouteGuard>
  );
}

type FlightListProps = {
  flights: SelectedFlight[];
  onSelect: (flight: SelectedFlight) => void;
  selectedFlightId: string | null;
  title: string;
};

function FlightList({
  flights,
  onSelect,
  selectedFlightId,
  title,
}: FlightListProps) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {flights.map((flight) => {
          const isSelected = selectedFlightId === flight.flightId;
          return (
            <article
              className={`border p-4 ${
                isSelected
                  ? "border-teal-700 bg-teal-50"
                  : "border-slate-200 bg-slate-50"
              }`}
              key={flight.flightId}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                    {flight.segmentType}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">
                    {flight.airline} {flight.flightNumber}
                  </h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {flight.origin} - {flight.destination}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {flight.departureDateTime} / {flight.arrivalDateTime}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    LFID {flight.lfid} - PFID {flight.pfid}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-950">
                    USD {flight.price.toLocaleString("en-US")}
                  </p>
                  <button
                    className="mt-3 border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-800"
                    onClick={() => onSelect(flight)}
                    type="button"
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
