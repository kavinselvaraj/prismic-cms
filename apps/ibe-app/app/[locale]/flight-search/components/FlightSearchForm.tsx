"use client";

import { useMemo, useRef, useState } from "react";
import { getDefaultFlightSearchFormValues } from "@/modules/route-search/utils/route-search-query";
import {
  type FlightSearchFieldErrors,
  validateFlightSearchForm,
} from "@/modules/route-search/utils/route-search-validation";
import type { FlightSearchFormValues } from "@/types/search-routes";

type FlightSearchFormProps = {
  initialValues?: FlightSearchFormValues;
  locale: string;
};

export function FlightSearchForm({
  initialValues,
  locale,
}: FlightSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FlightSearchFormValues>(
    initialValues ?? getDefaultFlightSearchFormValues(),
  );
  const [errors, setErrors] = useState<FlightSearchFieldErrors>({});

  const passengerSummary = useMemo(
    () =>
      `${values.passengers.adults} adult, ${values.passengers.children} child, ${values.passengers.infants} infant`,
    [values.passengers],
  );

  function updateField<Key extends keyof FlightSearchFormValues>(
    key: Key,
    value: FlightSearchFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updatePassengerField(
    key: keyof FlightSearchFormValues["passengers"],
    value: number,
  ) {
    setValues((current) => ({
      ...current,
      passengers: {
        ...current.passengers,
        [key]: value,
      },
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues: FlightSearchFormValues = {
      ...values,
      origin: values.origin.trim().toUpperCase(),
      destination: values.destination.trim().toUpperCase(),
      currency: values.currency.trim().toUpperCase(),
    };

    const validationErrors = validateFlightSearchForm(normalizedValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setValues(normalizedValues);

    window.requestAnimationFrame(() => {
      formRef.current?.submit();
    });
  }

  return (
    <form
      action={`/${locale}/flight-search/submit`}
      className="panel form-panel"
      method="post"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="panel-header">
        <div>
          <h2>Flight search</h2>
          <p className="panel-copy">
            Validate the form and navigate to flight selection with query params.
            This page does not call the route-search API.
          </p>
        </div>
        <span className="status-pill status-pill-mock">form only</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Origin</span>
          <input
            maxLength={3}
            name="origin"
            onChange={(event) => updateField("origin", event.target.value)}
            value={values.origin}
          />
          {errors.origin ? <small>{errors.origin}</small> : null}
        </label>

        <label className="field">
          <span>Destination</span>
          <input
            maxLength={3}
            name="destination"
            onChange={(event) => updateField("destination", event.target.value)}
            value={values.destination}
          />
          {errors.destination ? <small>{errors.destination}</small> : null}
        </label>

        <label className="field">
          <span>Departure date</span>
          <input
            name="departureDate"
            onChange={(event) => updateField("departureDate", event.target.value)}
            type="date"
            value={values.departureDate}
          />
          {errors.departureDate ? <small>{errors.departureDate}</small> : null}
        </label>

        <label className="field">
          <span>Return date</span>
          <input
            name="returnDate"
            onChange={(event) => updateField("returnDate", event.target.value)}
            type="date"
            value={values.returnDate}
          />
          {errors.returnDate ? <small>{errors.returnDate}</small> : null}
        </label>

        <label className="field">
          <span>Adults</span>
          <input
            min={1}
            name="adults"
            onChange={(event) =>
              updatePassengerField("adults", Number(event.target.value))
            }
            type="number"
            value={values.passengers.adults}
          />
          {errors.adults ? <small>{errors.adults}</small> : null}
        </label>

        <label className="field">
          <span>Children</span>
          <input
            min={0}
            name="children"
            onChange={(event) =>
              updatePassengerField("children", Number(event.target.value))
            }
            type="number"
            value={values.passengers.children}
          />
          {errors.children ? <small>{errors.children}</small> : null}
        </label>

        <label className="field">
          <span>Infants</span>
          <input
            min={0}
            name="infants"
            onChange={(event) =>
              updatePassengerField("infants", Number(event.target.value))
            }
            type="number"
            value={values.passengers.infants}
          />
          {errors.infants ? <small>{errors.infants}</small> : null}
        </label>

        <label className="field">
          <span>Currency</span>
          <select
            name="currency"
            onChange={(event) => updateField("currency", event.target.value)}
            value={values.currency}
          >
            <option value="USD">USD</option>
            <option value="JPY">JPY</option>
            <option value="SGD">SGD</option>
          </select>
          {errors.currency ? <small>{errors.currency}</small> : null}
        </label>
      </div>

      <div className="search-summary">
        <span className="meta-label">Passenger summary</span>
        <p>{passengerSummary}</p>
      </div>

      <div className="form-actions">
        <button type="submit">Search flights</button>
      </div>
    </form>
  );
}
