"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { airportOptions } from "../data/booking.mock";
import {
  flightSearchSchema,
  type FlightSearchFormValues,
} from "../schemas/booking.schemas";
import { createZodFormResolver } from "../schemas/zod-form-resolver";
import { setFlightSearchData } from "../store/booking.slice";
import { useAppDispatch } from "@/store/hooks";
import type { AppLocale } from "@/i18n/routing";
import { FieldError } from "./field-error";

type FlightSearchFormProps = {
  locale: AppLocale;
};

export function FlightSearchForm({ locale }: FlightSearchFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FlightSearchFormValues>({
    defaultValues: {
      ADT: 1,
      CHD: 0,
      INF: 0,
      departureAirport: "SIN",
      departureDate: "2026-07-10",
      destinationAirport: "NRT",
      returnDate: "2026-07-20",
      tripType: "ONE_WAY",
    },
    resolver: createZodFormResolver(flightSearchSchema),
  });

  const tripType = watch("tripType");

  function onSubmit(values: FlightSearchFormValues) {
    dispatch(
      setFlightSearchData({
        departureAirport: values.departureAirport,
        departureDate: values.departureDate,
        destinationAirport: values.destinationAirport,
        passengers: {
          ADT: values.ADT,
          CHD: values.CHD,
          INF: values.INF,
        },
        returnDate: values.tripType === "ROUND_TRIP" ? values.returnDate : undefined,
        tripType: values.tripType,
      }),
    );
    router.push(`/${locale}/flight-selection`);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Flight search
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Build an itinerary
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700">
          Search criteria is stored in Redux and drives numeric passenger IDs
          for the rest of the booking flow.
        </p>
      </section>

      <form
        className="mt-8 grid gap-6 border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800">Trip type</span>
            <select className="border border-slate-300 p-3" {...register("tripType")}>
              <option value="ONE_WAY">One way</option>
              <option value="ROUND_TRIP">Round trip</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800">
              Departure date
            </span>
            <input
              className="border border-slate-300 p-3"
              type="date"
              {...register("departureDate")}
            />
            <FieldError message={errors.departureDate?.message} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800">
              Departure airport
            </span>
            <select
              className="border border-slate-300 p-3"
              {...register("departureAirport")}
            >
              {airportOptions.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.departureAirport?.message} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-800">
              Destination airport
            </span>
            <select
              className="border border-slate-300 p-3"
              {...register("destinationAirport")}
            >
              {airportOptions.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.destinationAirport?.message} />
          </label>

          {tripType === "ROUND_TRIP" ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-800">
                Return date
              </span>
              <input
                className="border border-slate-300 p-3"
                type="date"
                {...register("returnDate")}
              />
              <FieldError message={errors.returnDate?.message} />
            </label>
          ) : null}
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">Passengers</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <PassengerCountInput label="Adult" name="ADT" register={register} />
            <PassengerCountInput label="Child" name="CHD" register={register} />
            <PassengerCountInput label="Infant" name="INF" register={register} />
          </div>
          <FieldError message={errors.ADT?.message} />
        </section>

        <div>
          <button
            className="bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Search flights
          </button>
        </div>
      </form>
    </main>
  );
}

type PassengerCountInputProps = {
  label: string;
  name: "ADT" | "CHD" | "INF";
  register: ReturnType<typeof useForm<FlightSearchFormValues>>["register"];
};

function PassengerCountInput({
  label,
  name,
  register,
}: PassengerCountInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        className="border border-slate-300 p-3"
        min={name === "ADT" ? 1 : 0}
        type="number"
        {...register(name)}
      />
    </label>
  );
}
