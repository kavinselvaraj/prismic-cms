import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";

export const sampleSearchRoutesRequest: SearchRoutesRequest = {
  origin: "NRT",
  destination: "LAX",
  departureDate: "2026-07-15",
  passengers: {
    adults: 1,
  },
};

export const mockSearchRoutes: SearchRoute[] = [
  {
    id: "mock-nrt-lax-001",
    origin: "NRT",
    destination: "LAX",
    departureDateTime: "2026-07-15T10:20:00+09:00",
    arrivalDateTime: "2026-07-15T04:40:00-07:00",
    carrierCode: "NX",
    flightNumber: "100",
    price: {
      amount: 825,
      currency: "USD",
    },
  },
  {
    id: "mock-nrt-lax-002",
    origin: "NRT",
    destination: "LAX",
    departureDateTime: "2026-07-15T17:35:00+09:00",
    arrivalDateTime: "2026-07-15T12:10:00-07:00",
    carrierCode: "NX",
    flightNumber: "108",
    price: {
      amount: 910,
      currency: "USD",
    },
  },
];
