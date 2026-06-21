import {
  type WebFlightSearchRequest,
  type WebFlightSearchQuery,
  mapQueryToFlightSearchRequest,
} from "@/ibe/utils/flight-search-query";

export type FlightSearchRoute = {
  arrivalDateTime: string;
  carrierCode: string;
  departureDateTime: string;
  destination: string;
  flightNumber: string;
  id: string;
  origin: string;
  price: {
    amount: number;
    currency: string;
  };
};

type FlightSearchResponse = {
  data: FlightSearchRoute[];
  error?: string;
};

export class FlightSearchServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FlightSearchServiceError";
    this.status = status;
  }
}

export async function searchFlights(params: {
  locale: string;
  query: WebFlightSearchQuery;
}) {
  const appABaseUrl = process.env.IBE_APP_BASE_URL ?? "http://localhost:3000";
  const request = mapQueryToFlightSearchRequest(params.query);
  const response = await fetch(`${appABaseUrl}/${params.locale}/api/search/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request satisfies WebFlightSearchRequest),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => undefined)) as
    | FlightSearchResponse
    | undefined;

  if (!response.ok) {
    throw new FlightSearchServiceError(
      result?.error ?? "Unable to search flights",
      response.status,
    );
  }

  return result?.data ?? [];
}
