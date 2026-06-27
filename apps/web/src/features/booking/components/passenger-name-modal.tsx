"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  passengerNamesSchema,
  type PassengerNamesFormValues,
} from "../schemas/booking.schemas";
import { createZodFormResolver } from "../schemas/zod-form-resolver";
import type { PassengerName } from "../types/booking.types";
import { FieldError } from "./field-error";

type PassengerNameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passengers: PassengerName[]) => void;
  passengers: PassengerName[];
};

export function PassengerNameModal({
  isOpen,
  onClose,
  onSubmit,
  passengers,
}: PassengerNameModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<PassengerNamesFormValues>({
    defaultValues: {
      passengers,
    },
    resolver: createZodFormResolver(passengerNamesSchema),
  });

  useEffect(() => {
    reset({ passengers });
  }, [passengers, reset]);

  if (!isOpen) {
    return null;
  }

  const watchedPassengers = watch("passengers");
  const adultPassengers = watchedPassengers.filter(
    (passenger) => passenger.type === "ADT",
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-auto border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Passenger names
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Passenger IDs are numeric and become the mapping key for bundles,
              seats, ancillaries, services, and customer information.
            </p>
          </div>
          <button
            className="border border-slate-300 px-3 py-2 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 grid gap-4"
          onSubmit={handleSubmit((values) => onSubmit(values.passengers))}
        >
          {watchedPassengers.map((passenger, index) => (
            <fieldset
              className="grid gap-4 border border-slate-200 p-4 md:grid-cols-4"
              key={passenger.id}
            >
              <legend className="px-2 text-sm font-semibold text-slate-700">
                Passenger {passenger.id} - {passenger.type}
              </legend>
              <input type="hidden" {...register(`passengers.${index}.id`)} />
              <input type="hidden" {...register(`passengers.${index}.type`)} />
              <label className="grid gap-2">
                <span className="text-sm font-medium">First name</span>
                <input
                  className="border border-slate-300 p-3"
                  {...register(`passengers.${index}.firstName`)}
                />
                <FieldError
                  message={errors.passengers?.[index]?.firstName?.message}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium">Last name</span>
                <input
                  className="border border-slate-300 p-3"
                  {...register(`passengers.${index}.lastName`)}
                />
                <FieldError
                  message={errors.passengers?.[index]?.lastName?.message}
                />
              </label>
              {passenger.type === "CHD" ? (
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-medium">Associate adult</span>
                  <select
                    className="border border-slate-300 p-3"
                    {...register(`passengers.${index}.associatedAdultId`)}
                  >
                    <option value="">Select adult</option>
                    {adultPassengers.map((adult) => (
                      <option key={adult.id} value={adult.id}>
                        Passenger {adult.id} - {adult.firstName || "Adult"}{" "}
                        {adult.lastName}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={errors.passengers?.[index]?.associatedAdultId?.message}
                  />
                </label>
              ) : null}
            </fieldset>
          ))}

          <div className="flex justify-end">
            <button
              className="bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
              type="submit"
            >
              Continue to packages
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
