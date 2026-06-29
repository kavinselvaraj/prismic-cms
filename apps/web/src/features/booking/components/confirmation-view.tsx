"use client";

import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import {
  selectBookingState,
  selectCanAccessConfirmation,
  selectConfirmationPayload,
} from "../store/booking.selectors";
import { buildConfirmationPayload } from "../store/booking.slice";
import { buildCreateBookingRequest } from "../utils/booking.helpers";
import { BookingRouteGuard } from "./booking-route-guard";

type ConfirmationViewProps = {
  locale: AppLocale;
};

export function ConfirmationView({ locale }: ConfirmationViewProps) {
  const dispatch = useAppDispatch();
  const booking = useAppSelector(selectBookingState);
  const canAccess = useAppSelector(selectCanAccessConfirmation);
  const storedPayload = useAppSelector(selectConfirmationPayload);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const payload =
    storedPayload ?? (canAccess ? buildCreateBookingRequest(booking) : null);

  async function confirmBooking() {
    if (!payload) {
      return;
    }

    dispatch(buildConfirmationPayload(payload));
    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/booking/confirm", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Confirm booking failed with status ${response.status}`,
        );
      }

      setStatus("success");
      setMessage("Booking request submitted successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to confirm booking.",
      );
    }
  }

  return (
    <BookingRouteGuard
      isAllowed={canAccess}
      redirectTo={`/${locale}/customer-information`}
    >
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Confirmation
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            Review final backend payload
          </h1>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <p>Trip type: {payload?.tripType}</p>
              <p>
                Route: {payload?.search.departureAirport} -{" "}
                {payload?.search.destinationAirport}
              </p>
              <p>Passengers: {payload?.passengers.length ?? 0}</p>
              <p>
                Outbound: {payload?.selectedFlights.outbound.flightNumber} /{" "}
                {payload?.selectedFlights.outbound.lfid}
              </p>
              {payload?.selectedFlights.return ? (
                <p>
                  Return: {payload.selectedFlights.return.flightNumber} /{" "}
                  {payload.selectedFlights.return.lfid}
                </p>
              ) : null}
            </div>

            <button
              className="mt-6 bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={status === "submitting"}
              onClick={() => void confirmBooking()}
              type="button"
            >
              {status === "submitting" ? "Confirming..." : "Confirm Booking"}
            </button>

            {message ? (
              <p
                className={`mt-4 border p-3 text-sm ${
                  status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {message}
              </p>
            ) : null}
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              CreateBookingRequest
            </h2>
            <pre className="mt-4 max-h-[720px] overflow-auto border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </section>
        </div>
      </main>
    </BookingRouteGuard>
  );
}
