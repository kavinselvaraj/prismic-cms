export type SearchRoutesRequest = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
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
