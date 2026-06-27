"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ancillaryOptions,
  seatOptions,
  serviceOptions,
} from "../data/booking.mock";
import {
  setAncillarySelection,
  setSeatSelection,
  setServiceSelection,
} from "../store/booking.slice";
import {
  selectBookingState,
  selectCanAccessAncillaryServices,
  selectPassengerNames,
} from "../store/booking.selectors";
import type {
  AncillaryCode,
  PassengerAncillarySelectionState,
  PassengerSeatSelectionState,
  PassengerServiceSelectionState,
  SegmentType,
} from "../types/booking.types";
import { getRequiredSegments, getSelectedFlightBySegment } from "../utils/booking.helpers";
import { BookingRouteGuard } from "./booking-route-guard";
import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type AncillaryServicesViewProps = {
  locale: AppLocale;
};

export function AncillaryServicesView({ locale }: AncillaryServicesViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const booking = useAppSelector(selectBookingState);
  const canAccess = useAppSelector(selectCanAccessAncillaryServices);
  const passengerNames = useAppSelector(selectPassengerNames);
  const [seats, setSeats] =
    useState<PassengerSeatSelectionState[]>(booking.seats);
  const [ancillaries, setAncillaries] =
    useState<PassengerAncillarySelectionState[]>(booking.ancillaries);
  const [services, setServices] =
    useState<PassengerServiceSelectionState[]>(booking.services);
  const segments = getRequiredSegments(booking.search);

  function upsertSeat(
    segmentType: SegmentType,
    passengerId: number,
    seatNumber: string,
  ) {
    const flight = getSelectedFlightBySegment(booking, segmentType);
    const seat = seatOptions.find((option) => option.seatNumber === seatNumber);

    if (!flight || !seat) {
      return;
    }

    setSeats((current) => [
      ...current.filter(
        (item) =>
          !(item.passengerId === passengerId && item.segmentType === segmentType),
      ),
      {
        flightId: flight.flightId,
        lfid: flight.lfid,
        passengerId,
        pfid: flight.pfid,
        price: seat.price,
        seatNumber: seat.seatNumber,
        segmentType,
      },
    ]);
  }

  function toggleAncillary(
    segmentType: SegmentType,
    passengerId: number,
    ancillaryCode: AncillaryCode,
  ) {
    const flight = getSelectedFlightBySegment(booking, segmentType);
    const ancillary = ancillaryOptions.find((option) => option.code === ancillaryCode);

    if (!flight || !ancillary) {
      return;
    }

    setAncillaries((current) => {
      const exists = current.some(
        (item) =>
          item.passengerId === passengerId &&
          item.segmentType === segmentType &&
          item.code === ancillaryCode,
      );

      if (exists) {
        return current.filter(
          (item) =>
            !(
              item.passengerId === passengerId &&
              item.segmentType === segmentType &&
              item.code === ancillaryCode
            ),
        );
      }

      return [
        ...current,
        {
          code: ancillary.code,
          flightId: flight.flightId,
          lfid: flight.lfid,
          name: ancillary.name,
          passengerId,
          pfid: flight.pfid,
          price: ancillary.price,
          quantity: 1,
          segmentType,
        },
      ];
    });
  }

  function toggleService(
    segmentType: SegmentType,
    passengerId: number,
    serviceCode: string,
  ) {
    const flight = getSelectedFlightBySegment(booking, segmentType);
    const service = serviceOptions.find((option) => option.code === serviceCode);

    if (!flight || !service) {
      return;
    }

    setServices((current) => {
      const exists = current.some(
        (item) =>
          item.passengerId === passengerId &&
          item.segmentType === segmentType &&
          item.code === serviceCode,
      );

      if (exists) {
        return current.filter(
          (item) =>
            !(
              item.passengerId === passengerId &&
              item.segmentType === segmentType &&
              item.code === serviceCode
            ),
        );
      }

      return [
        ...current,
        {
          chargeable: service.chargeable,
          code: service.code,
          flightId: flight.flightId,
          lfid: flight.lfid,
          name: service.name,
          passengerId,
          pfid: flight.pfid,
          price: service.price,
          quantity: 1,
          segmentType,
          serviceType: service.serviceType,
        },
      ];
    });
  }

  function handleNext() {
    dispatch(setSeatSelection(seats));
    dispatch(setAncillarySelection(ancillaries));
    dispatch(setServiceSelection(services));
    router.push(`/${locale}/customer-information`);
  }

  return (
    <BookingRouteGuard
      isAllowed={canAccess}
      redirectTo={`/${locale}/package-selection`}
    >
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Ancillary services
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            Select seats, ancillaries, and services
          </h1>
        </section>

        <div className="mt-8 grid gap-6">
          {segments.map((segmentType) => (
            <section className="border border-slate-200 bg-white p-5" key={segmentType}>
              <h2 className="text-lg font-semibold text-slate-950">
                {segmentType} selections
              </h2>
              <div className="mt-4 grid gap-4">
                {passengerNames.map((passenger) => (
                  <article
                    className="grid gap-4 border border-slate-200 bg-slate-50 p-4"
                    key={`${segmentType}-${passenger.id}`}
                  >
                    <h3 className="font-semibold text-slate-950">
                      Passenger {passenger.id}: {passenger.firstName}{" "}
                      {passenger.lastName}
                    </h3>

                    <SelectionGroup title="Seat">
                      <select
                        className="border border-slate-300 p-3"
                        onChange={(event) =>
                          upsertSeat(segmentType, passenger.id, event.target.value)
                        }
                        value={
                          seats.find(
                            (seat) =>
                              seat.passengerId === passenger.id &&
                              seat.segmentType === segmentType,
                          )?.seatNumber ?? ""
                        }
                      >
                        <option value="">Select seat</option>
                        {seatOptions.map((seat) => (
                          <option key={seat.seatNumber} value={seat.seatNumber}>
                            {seat.seatNumber} - USD {seat.price}
                          </option>
                        ))}
                      </select>
                    </SelectionGroup>

                    <SelectionGroup title="Ancillaries">
                      {ancillaryOptions.map((ancillary) => (
                        <CheckboxOption
                          checked={ancillaries.some(
                            (item) =>
                              item.passengerId === passenger.id &&
                              item.segmentType === segmentType &&
                              item.code === ancillary.code,
                          )}
                          key={ancillary.code}
                          label={`${ancillary.name} - USD ${ancillary.price}`}
                          onChange={() =>
                            toggleAncillary(
                              segmentType,
                              passenger.id,
                              ancillary.code,
                            )
                          }
                        />
                      ))}
                    </SelectionGroup>

                    <SelectionGroup title="Services">
                      {serviceOptions.map((service) => (
                        <CheckboxOption
                          checked={services.some(
                            (item) =>
                              item.passengerId === passenger.id &&
                              item.segmentType === segmentType &&
                              item.code === service.code,
                          )}
                          key={service.code}
                          label={`${service.name} - ${service.serviceType} - USD ${service.price}`}
                          onChange={() =>
                            toggleService(segmentType, passenger.id, service.code)
                          }
                        />
                      ))}
                    </SelectionGroup>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <button
          className="mt-6 bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
          onClick={handleNext}
          type="button"
        >
          Continue to customer information
        </button>
      </main>
    </BookingRouteGuard>
  );
}

function SelectionGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h4>
      <div className="grid gap-2 md:grid-cols-3">{children}</div>
    </div>
  );
}

function CheckboxOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 border border-slate-200 bg-white p-3 text-sm">
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
