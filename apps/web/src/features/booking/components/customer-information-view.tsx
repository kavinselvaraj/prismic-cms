"use client";

import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import {
  type CustomerInformationFormValues,
  customerInformationSchema,
} from "../schemas/booking.schemas";
import { createZodFormResolver } from "../schemas/zod-form-resolver";
import {
  selectBookingState,
  selectCanAccessCustomerInformation,
  selectCustomerInformation,
  selectPassengerNames,
} from "../store/booking.selectors";
import {
  buildConfirmationPayload,
  initializeCustomerInformationFromPassengers,
  setCustomerInformation,
} from "../store/booking.slice";
import type { CustomerInformationState } from "../types/booking.types";
import { buildCreateBookingRequest } from "../utils/booking.helpers";
import { BookingRouteGuard } from "./booking-route-guard";
import { FieldError } from "./field-error";

type CustomerInformationViewProps = {
  locale: AppLocale;
};

export function CustomerInformationView({
  locale,
}: CustomerInformationViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const booking = useAppSelector(selectBookingState);
  const canAccess = useAppSelector(selectCanAccessCustomerInformation);
  const customerInformation = useAppSelector(selectCustomerInformation);
  const passengerNames = useAppSelector(selectPassengerNames);
  const customers = useMemo(
    () =>
      passengerNames
        .map((passenger) =>
          customerInformation.find(
            (customer) => customer.passengerId === passenger.id,
          ),
        )
        .filter(isCustomerInformationState),
    [customerInformation, passengerNames],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CustomerInformationFormValues>({
    defaultValues: {
      customers,
    },
    resolver: createZodFormResolver(customerInformationSchema),
  });

  useEffect(() => {
    dispatch(initializeCustomerInformationFromPassengers(passengerNames));
  }, [dispatch, passengerNames]);

  useEffect(() => {
    reset({ customers });
  }, [customers, reset]);

  function onSubmit(values: CustomerInformationFormValues) {
    const nextCustomerInformation =
      values.customers as CustomerInformationState[];

    dispatch(setCustomerInformation(nextCustomerInformation));
    dispatch(
      buildConfirmationPayload(
        buildCreateBookingRequest({
          ...booking,
          customerInformation: nextCustomerInformation,
        }),
      ),
    );
    router.push(`/${locale}/confirmation`);
  }

  return (
    <BookingRouteGuard
      isAllowed={canAccess}
      redirectTo={`/${locale}/flight-selection`}
    >
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Customer information
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">
            Complete passenger details
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            First and last names are prefilled from the passenger name modal.
          </p>
        </section>

        <form className="mt-8 grid gap-6" onSubmit={handleSubmit(onSubmit)}>
          {customers.map((customer, index) => (
            <section
              className="grid gap-5 border border-slate-200 bg-white p-5 shadow-sm"
              key={customer.passengerId}
            >
              <input
                type="hidden"
                {...register(`customers.${index}.passengerId`)}
              />
              <h2 className="text-xl font-semibold text-slate-950">
                Passenger {customer.passengerId}:{" "}
                {customer.passengerInformation.firstName}{" "}
                {customer.passengerInformation.lastName}
              </h2>

              <FormGrid title="Passenger basic information">
                <TextField
                  label="First name"
                  registration={register(
                    `customers.${index}.passengerInformation.firstName`,
                  )}
                />
                <TextField
                  label="Last name"
                  registration={register(
                    `customers.${index}.passengerInformation.lastName`,
                  )}
                />
                <SelectField
                  label="Gender"
                  registration={register(
                    `customers.${index}.passengerInformation.gender`,
                  )}
                />
                <TextField
                  label="Date of birth"
                  registration={register(
                    `customers.${index}.passengerInformation.dateOfBirth`,
                  )}
                  type="date"
                />
                <TextField
                  label="Nationality"
                  registration={register(
                    `customers.${index}.passengerInformation.nationality`,
                  )}
                />
              </FormGrid>

              <FormGrid title="Contact information">
                <TextField
                  label="Email"
                  registration={register(
                    `customers.${index}.contactInformation.email`,
                  )}
                  type="email"
                />
                <TextField
                  label="Country code"
                  registration={register(
                    `customers.${index}.contactInformation.countryCode`,
                  )}
                />
                <TextField
                  label="Phone number"
                  registration={register(
                    `customers.${index}.contactInformation.phoneNumber`,
                  )}
                />
              </FormGrid>

              <FormGrid title="Passport information">
                <TextField
                  label="Passport number"
                  registration={register(
                    `customers.${index}.passportInformation.passportNumber`,
                  )}
                />
                <TextField
                  label="Issuing country"
                  registration={register(
                    `customers.${index}.passportInformation.passportIssuingCountry`,
                  )}
                />
                <TextField
                  label="Passport expiry"
                  registration={register(
                    `customers.${index}.passportInformation.passportExpiryDate`,
                  )}
                  type="date"
                />
                <TextField
                  label="Nationality"
                  registration={register(
                    `customers.${index}.passportInformation.nationality`,
                  )}
                />
                <TextField
                  label="Date of birth"
                  registration={register(
                    `customers.${index}.passportInformation.dateOfBirth`,
                  )}
                  type="date"
                />
                <SelectField
                  label="Gender"
                  registration={register(
                    `customers.${index}.passportInformation.gender`,
                  )}
                />
              </FormGrid>

              {errors.customers?.[index] ? (
                <FieldError message="Please complete the required passenger details." />
              ) : null}
            </section>
          ))}

          <button
            className="w-fit bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
            type="submit"
          >
            Continue to confirmation
          </button>
        </form>
      </main>
    </BookingRouteGuard>
  );
}

type FieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  type?: string;
};

function FormGrid({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </legend>
      <div className="grid gap-4 md:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function TextField({ label, registration, type = "text" }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        className="border border-slate-300 p-3"
        type={type}
        {...registration}
      />
    </label>
  );
}

function SelectField({ label, registration }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <select className="border border-slate-300 p-3" {...registration}>
        <option value="">Select</option>
        <option value="FEMALE">Female</option>
        <option value="MALE">Male</option>
        <option value="OTHER">Other</option>
      </select>
    </label>
  );
}

function isCustomerInformationState(
  customer: CustomerInformationState | undefined,
): customer is CustomerInformationState {
  return Boolean(customer);
}
