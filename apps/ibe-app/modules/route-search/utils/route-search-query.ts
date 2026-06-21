import type {
  FlightSearchFormValues,
  SearchRoutesRequest,
} from "@/types/search-routes";

type RouteSearchSearchParams = Record<
  string,
  string | string[] | undefined
>;

const DEFAULT_FORM_VALUES: FlightSearchFormValues = {
  origin: "NRT",
  destination: "LAX",
  departureDate: "2026-07-15",
  returnDate: "",
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  currency: "USD",
};

export function getDefaultFlightSearchFormValues(): FlightSearchFormValues {
  return {
    ...DEFAULT_FORM_VALUES,
    passengers: { ...DEFAULT_FORM_VALUES.passengers },
  };
}

export function readFlightSearchDraftFromSearchParams(
  searchParams: RouteSearchSearchParams,
): FlightSearchFormValues {
  const defaults = getDefaultFlightSearchFormValues();

  return {
    origin: getSingleParam(searchParams.origin) ?? defaults.origin,
    destination: getSingleParam(searchParams.destination) ?? defaults.destination,
    departureDate:
      getSingleParam(searchParams.departureDate) ?? defaults.departureDate,
    returnDate: getSingleParam(searchParams.returnDate) ?? defaults.returnDate,
    passengers: {
      adults:
        parseCount(searchParams.adults, defaults.passengers.adults) ??
        defaults.passengers.adults,
      children:
        parseCount(searchParams.children, defaults.passengers.children) ??
        defaults.passengers.children,
      infants:
        parseCount(searchParams.infants, defaults.passengers.infants) ??
        defaults.passengers.infants,
    },
    currency: getSingleParam(searchParams.currency) ?? defaults.currency,
  };
}

export function buildFlightSearchQueryParams(
  values: FlightSearchFormValues,
): URLSearchParams {
  const params = new URLSearchParams({
    adults: String(values.passengers.adults),
    currency: values.currency,
    departureDate: values.departureDate,
    destination: values.destination,
    origin: values.origin,
  });

  if (values.returnDate) {
    params.set("returnDate", values.returnDate);
  }

  if (values.passengers.children > 0) {
    params.set("children", String(values.passengers.children));
  }

  if (values.passengers.infants > 0) {
    params.set("infants", String(values.passengers.infants));
  }

  return params;
}

export function stringifyFlightSearchSearchParams(
  searchParams: RouteSearchSearchParams,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }

      continue;
    }

    if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function parseFlightSearchQueryParams(
  searchParams: RouteSearchSearchParams,
): FlightSearchFormValues | null {
  const origin = getSingleParam(searchParams.origin)?.trim().toUpperCase();
  const destination = getSingleParam(searchParams.destination)?.trim().toUpperCase();
  const departureDate = getSingleParam(searchParams.departureDate)?.trim();
  const returnDate = getSingleParam(searchParams.returnDate)?.trim() ?? "";
  const currency = getSingleParam(searchParams.currency)?.trim().toUpperCase();
  const adults = parseCount(searchParams.adults);
  const children = parseCount(searchParams.children, 0);
  const infants = parseCount(searchParams.infants, 0);

  if (!origin || !destination || !departureDate || !currency || adults === null) {
    return null;
  }

  if (children === null || infants === null) {
    return null;
  }

  return {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers: {
      adults,
      children,
      infants,
    },
    currency,
  };
}

export function mapFlightSearchFormToRequest(
  values: FlightSearchFormValues,
): SearchRoutesRequest {
  return {
    origin: values.origin,
    destination: values.destination,
    departureDate: values.departureDate,
    returnDate: values.returnDate || undefined,
    passengers: {
      adults: values.passengers.adults,
      children: values.passengers.children || undefined,
      infants: values.passengers.infants || undefined,
    },
  };
}

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseCount(
  value?: string | string[],
  fallback: number | null = null,
): number | null {
  const raw = getSingleParam(value);

  if (raw === undefined || raw === "") {
    return fallback;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
