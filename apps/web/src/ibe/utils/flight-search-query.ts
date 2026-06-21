export type WebFlightSearchQuery = {
  adults: number;
  children: number;
  currency: string;
  departureDate: string;
  destination: string;
  infants: number;
  origin: string;
  returnDate: string;
};

export type WebFlightSearchRequest = {
  departureDate: string;
  destination: string;
  origin: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  returnDate?: string;
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function parseFlightSearchQuery(
  searchParams: SearchParamsRecord,
): WebFlightSearchQuery | null {
  const origin = getParam(searchParams.origin)?.trim().toUpperCase();
  const destination = getParam(searchParams.destination)?.trim().toUpperCase();
  const departureDate = getParam(searchParams.departureDate)?.trim();
  const returnDate = getParam(searchParams.returnDate)?.trim() ?? "";
  const currency = getParam(searchParams.currency)?.trim().toUpperCase();
  const adults = parseCount(searchParams.adults);
  const children = parseCount(searchParams.children, 0);
  const infants = parseCount(searchParams.infants, 0);

  if (!origin || !destination || !departureDate || !currency || adults === null) {
    return null;
  }

  if (children === null || infants === null) {
    return null;
  }

  const query = {
    adults,
    children,
    currency,
    departureDate,
    destination,
    infants,
    origin,
    returnDate,
  };

  return isValidFlightSearchQuery(query) ? query : null;
}

export function parseFlightSearchCookieValue(
  value: string | undefined,
): WebFlightSearchQuery | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<WebFlightSearchQuery> & {
      passengers?: {
        adults?: number;
        children?: number;
        infants?: number;
      };
    };

    const query: WebFlightSearchQuery = {
      adults: parsed.passengers?.adults ?? 0,
      children: parsed.passengers?.children ?? 0,
      currency: String(parsed.currency ?? "").trim().toUpperCase(),
      departureDate: String(parsed.departureDate ?? "").trim(),
      destination: String(parsed.destination ?? "").trim().toUpperCase(),
      infants: parsed.passengers?.infants ?? 0,
      origin: String(parsed.origin ?? "").trim().toUpperCase(),
      returnDate: String(parsed.returnDate ?? "").trim(),
    };

    return isValidFlightSearchQuery(query) ? query : null;
  } catch {
    return null;
  }
}

export function mapQueryToFlightSearchRequest(
  query: WebFlightSearchQuery,
): WebFlightSearchRequest {
  return {
    departureDate: query.departureDate,
    destination: query.destination,
    origin: query.origin,
    passengers: {
      adults: query.adults,
      children: query.children || undefined,
      infants: query.infants || undefined,
    },
    returnDate: query.returnDate || undefined,
  };
}

export function stringifyFlightSearchSearchParams(
  searchParams: SearchParamsRecord,
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

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isValidFlightSearchQuery(query: WebFlightSearchQuery) {
  if (!/^[A-Z]{3}$/.test(query.origin) || !/^[A-Z]{3}$/.test(query.destination)) {
    return false;
  }

  if (!isIsoDate(query.departureDate)) {
    return false;
  }

  if (query.returnDate && !isIsoDate(query.returnDate)) {
    return false;
  }

  if (query.returnDate && query.returnDate < query.departureDate) {
    return false;
  }

  return query.adults >= 1;
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime());
}

function parseCount(
  value?: string | string[],
  fallback: number | null = null,
): number | null {
  const raw = getParam(value);

  if (raw === undefined || raw === "") {
    return fallback;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
