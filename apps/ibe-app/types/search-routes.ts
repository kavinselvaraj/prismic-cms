export type PassengerCounts = {
  adults: number;
  children?: number;
  infants?: number;
};

export type SearchRoutesRequest = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
};

export type SearchRoute = {
  id: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  carrierCode: string;
  flightNumber: string;
  price: {
    amount: number;
    currency: string;
  };
};

export type FlightSearchFormValues = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  currency: string;
};
