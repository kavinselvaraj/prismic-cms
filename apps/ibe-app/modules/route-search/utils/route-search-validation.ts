import type { FlightSearchFormValues } from "@/types/search-routes";

export type FlightSearchFieldErrors = Partial<
  Record<
    | "origin"
    | "destination"
    | "departureDate"
    | "returnDate"
    | "adults"
    | "children"
    | "infants"
    | "currency",
    string
  >
>;

export function validateFlightSearchForm(
  values: FlightSearchFormValues,
): FlightSearchFieldErrors {
  const errors: FlightSearchFieldErrors = {};

  if (!isAirportCode(values.origin)) {
    errors.origin = "Enter a valid origin airport code.";
  }

  if (!isAirportCode(values.destination)) {
    errors.destination = "Enter a valid destination airport code.";
  }

  if (!isIsoDate(values.departureDate)) {
    errors.departureDate = "Enter a valid departure date.";
  }

  if (values.returnDate && !isIsoDate(values.returnDate)) {
    errors.returnDate = "Enter a valid return date.";
  }

  if (
    isIsoDate(values.departureDate) &&
    values.returnDate &&
    isIsoDate(values.returnDate) &&
    values.returnDate < values.departureDate
  ) {
    errors.returnDate = "Return date must be after departure date.";
  }

  if (!Number.isInteger(values.passengers.adults) || values.passengers.adults < 1) {
    errors.adults = "At least one adult is required.";
  }

  if (
    !Number.isInteger(values.passengers.children) ||
    values.passengers.children < 0
  ) {
    errors.children = "Children count cannot be negative.";
  }

  if (
    !Number.isInteger(values.passengers.infants) ||
    values.passengers.infants < 0
  ) {
    errors.infants = "Infant count cannot be negative.";
  }

  if (!values.currency.trim()) {
    errors.currency = "Select a currency.";
  }

  return errors;
}

export function isValidFlightSearch(values: FlightSearchFormValues) {
  return Object.keys(validateFlightSearchForm(values)).length === 0;
}

function isAirportCode(value: string) {
  return /^[A-Z]{3}$/.test(value.trim().toUpperCase());
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime());
}
