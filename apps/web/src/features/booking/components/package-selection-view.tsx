"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bundleOptions } from "../data/booking.mock";
import { setBundleSelection } from "../store/booking.slice";
import {
  selectBookingState,
  selectCanAccessPackageSelection,
  selectPassengerNames,
} from "../store/booking.selectors";
import type {
  BundleCode,
  PassengerBundleSelectionState,
  SegmentType,
} from "../types/booking.types";
import { getRequiredSegments, getSelectedFlightBySegment } from "../utils/booking.helpers";
import { BookingRouteGuard } from "./booking-route-guard";
import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type PackageSelectionViewProps = {
  locale: AppLocale;
};

export function PackageSelectionView({ locale }: PackageSelectionViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const booking = useAppSelector(selectBookingState);
  const canAccess = useAppSelector(selectCanAccessPackageSelection);
  const passengerNames = useAppSelector(selectPassengerNames);
  const [bundles, setBundles] =
    useState<PassengerBundleSelectionState[]>(booking.bundles);
  const [error, setError] = useState<string | null>(null);
  const segments = getRequiredSegments(booking.search);

  function updateBundle(
    segmentType: SegmentType,
    passengerId: number,
    bundleCode: BundleCode,
  ) {
    const flight = getSelectedFlightBySegment(booking, segmentType);
    const bundle = bundleOptions.find((option) => option.code === bundleCode);

    if (!flight || !bundle) {
      return;
    }

    setBundles((current) => [
      ...current.filter(
        (item) =>
          !(item.passengerId === passengerId && item.segmentType === segmentType),
      ),
      {
        code: bundle.code,
        flightId: flight.flightId,
        lfid: flight.lfid,
        name: bundle.name,
        passengerId,
        pfid: flight.pfid,
        price: bundle.price,
        segmentType,
      },
    ]);
  }

  function selectedBundleCode(segmentType: SegmentType, passengerId: number) {
    return bundles.find(
      (bundle) =>
        bundle.passengerId === passengerId && bundle.segmentType === segmentType,
    )?.code;
  }

  function handleNext() {
    const hasAllBundles = passengerNames.every((passenger) =>
      segments.every((segmentType) => selectedBundleCode(segmentType, passenger.id)),
    );

    if (!hasAllBundles) {
      setError("Select bundle options for every passenger and flight segment.");
      return;
    }

    dispatch(setBundleSelection(bundles));
    router.push(`/${locale}/ancillary-services`);
  }

  return (
    <BookingRouteGuard
      isAllowed={canAccess}
      redirectTo={`/${locale}/flight-selection`}
    >
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Package selection
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            Select bundles by passenger
          </h1>
        </section>

        <div className="mt-8 grid gap-6">
          {segments.map((segmentType) => (
            <section className="border border-slate-200 bg-white p-5" key={segmentType}>
              <h2 className="text-lg font-semibold text-slate-950">
                {segmentType} bundles
              </h2>
              <div className="mt-4 grid gap-4">
                {passengerNames.map((passenger) => (
                  <div
                    className="grid gap-3 border border-slate-200 bg-slate-50 p-4"
                    key={`${segmentType}-${passenger.id}`}
                  >
                    <h3 className="font-semibold text-slate-950">
                      Passenger {passenger.id}: {passenger.firstName}{" "}
                      {passenger.lastName}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-4">
                      {bundleOptions.map((bundle) => (
                        <label
                          className="grid gap-2 border border-slate-200 bg-white p-3"
                          key={bundle.code}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              checked={
                                selectedBundleCode(segmentType, passenger.id) ===
                                bundle.code
                              }
                              onChange={() =>
                                updateBundle(
                                  segmentType,
                                  passenger.id,
                                  bundle.code,
                                )
                              }
                              type="radio"
                            />
                            <strong>{bundle.name}</strong>
                          </span>
                          <span className="text-sm text-slate-600">
                            {bundle.description}
                          </span>
                          <span className="text-sm font-semibold">
                            USD {bundle.price.toLocaleString("en-US")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        <button
          className="mt-6 bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
          onClick={handleNext}
          type="button"
        >
          Continue to ancillaries
        </button>
      </main>
    </BookingRouteGuard>
  );
}
