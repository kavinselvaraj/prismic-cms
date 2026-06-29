export type TripType = "ONE_WAY" | "ROUND_TRIP";
export type PassengerType = "ADT" | "CHD" | "INF";
export type SegmentType = "OUTBOUND" | "RETURN";

export type BookingStep =
  | "FLIGHT_SEARCH"
  | "FLIGHT_SELECTION"
  | "PACKAGE_SELECTION"
  | "ANCILLARY_SERVICES"
  | "CUSTOMER_INFORMATION"
  | "CONFIRMATION";

export type PassengerCounts = {
  ADT: number;
  CHD: number;
  INF: number;
};

export type FlightSearchState = {
  departureAirport: string;
  departureDate: string;
  destinationAirport: string;
  passengers: PassengerCounts;
  returnDate?: string;
  tripType: TripType;
};

export type SelectedFlight = {
  aircraft: string;
  airline: string;
  arrivalDateTime: string;
  destination: string;
  duration: string;
  flightId: string;
  flightNumber: string;
  lfid: string;
  origin: string;
  pfid: string;
  price: number;
  segmentType: SegmentType;
  departureDateTime: string;
};

export type PassengerName = {
  associatedAdultId?: number;
  firstName: string;
  id: number;
  lastName: string;
  type: PassengerType;
};

export type BundleCode = "VALUE" | "PREMIUM" | "FLEX" | "NO_BUNDLE";

export type BundleOption = {
  code: BundleCode;
  description: string;
  name: string;
  price: number;
};

export type SeatOption = {
  price: number;
  seatNumber: string;
};

export type AncillaryCode = "BAG20" | "BAG30" | "SPORTS";

export type AncillaryOption = {
  code: AncillaryCode;
  name: string;
  price: number;
};

export type ServiceType = "MEAL" | "NON_CHARGEABLE_SSR" | "OTHER";

export type ServiceOption = {
  chargeable: boolean;
  code: string;
  name: string;
  price: number;
  serviceType: ServiceType;
};

export type FlightScopedSelectionState = {
  flightId: string;
  lfid: string;
  passengerId: number;
  pfid: string;
  segmentType: SegmentType;
};

export type PassengerBundleSelectionState = FlightScopedSelectionState & {
  code: BundleCode;
  name: string;
  price: number;
};

export type PassengerSeatSelectionState = FlightScopedSelectionState & {
  price: number;
  seatNumber: string;
};

export type PassengerAncillarySelectionState = FlightScopedSelectionState & {
  code: string;
  name: string;
  price: number;
  quantity: number;
};

export type PassengerServiceSelectionState = FlightScopedSelectionState & {
  chargeable: boolean;
  code: string;
  name: string;
  price: number;
  quantity: number;
  serviceType: ServiceType;
};

export type CustomerInformationState = {
  contactInformation: {
    countryCode?: string;
    email?: string;
    phoneNumber?: string;
  };
  passengerId: number;
  passengerInformation: {
    dateOfBirth?: string;
    firstName: string;
    gender?: string;
    lastName: string;
    nationality?: string;
  };
  passportInformation: {
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    passportExpiryDate?: string;
    passportIssuingCountry?: string;
    passportNumber?: string;
  };
};

export type FlightSearchPageState = {
  search: FlightSearchState | null;
};

export type FlightSelectionPageState = {
  selectedOutboundFlight: SelectedFlight | null;
  selectedReturnFlight: SelectedFlight | null;
};

export type PassengerPageState = {
  passengerNames: PassengerName[];
};

export type PackageSelectionPageState = {
  bundles: PassengerBundleSelectionState[];
};

export type AncillaryServicesPageState = {
  ancillaries: PassengerAncillarySelectionState[];
  seats: PassengerSeatSelectionState[];
  services: PassengerServiceSelectionState[];
};

export type CustomerInformationPageState = {
  customerInformation: CustomerInformationState[];
};

export type ConfirmationPageState = {
  confirmationPayload: CreateBookingRequest | null;
};

export type BookingFlowState = {
  currentStep: BookingStep;
};

export type CreateBookingRequest = {
  passengers: BookingPassengerRequest[];
  search: FlightSearchRequest;
  selectedFlights: SelectedFlightsRequest;
  tripType: TripType;
};

export type FlightSearchRequest = {
  departureAirport: string;
  departureDate: string;
  destinationAirport: string;
  passengers: PassengerCounts;
  returnDate?: string;
};

export type SelectedFlightsRequest = {
  outbound: SelectedFlightRequest;
  return?: SelectedFlightRequest;
};

export type SelectedFlightRequest = {
  arrivalDateTime: string;
  departureDateTime: string;
  destination: string;
  flightId: string;
  flightNumber: string;
  lfid: string;
  origin: string;
  pfid: string;
  price: number;
};

export type BookingPassengerRequest = {
  ancillaries: PassengerAncillaryRequest[];
  bundles: PassengerBundleRequest[];
  contactInformation?: ContactInformationRequest;
  passengerId: number;
  passengerInformation: PassengerInformationRequest;
  passengerType: PassengerType;
  passportInformation?: PassportInformationRequest;
  seats: PassengerSeatRequest[];
  services: PassengerServiceRequest[];
};

export type PassengerInformationRequest = {
  associatedAdultId?: number;
  dateOfBirth?: string;
  firstName: string;
  gender?: string;
  lastName: string;
  nationality?: string;
};

export type ContactInformationRequest = {
  countryCode?: string;
  email?: string;
  phoneNumber?: string;
};

export type PassportInformationRequest = {
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  passportExpiryDate?: string;
  passportIssuingCountry?: string;
  passportNumber?: string;
};

export type FlightItemBaseRequest = {
  lfid: string;
  pfid: string;
};

export type PassengerBundleRequest = FlightItemBaseRequest & {
  code: BundleCode;
  name: string;
  price: number;
};

export type PassengerSeatRequest = FlightItemBaseRequest & {
  price: number;
  seatNumber: string;
};

export type PassengerAncillaryRequest = FlightItemBaseRequest & {
  code: string;
  name: string;
  price: number;
  quantity: number;
};

export type PassengerServiceRequest = FlightItemBaseRequest & {
  chargeable: boolean;
  code: string;
  name: string;
  price: number;
  quantity: number;
  serviceType: ServiceType;
};

export type BookingState = FlightSearchPageState &
  FlightSelectionPageState &
  PassengerPageState &
  PackageSelectionPageState &
  AncillaryServicesPageState &
  CustomerInformationPageState &
  ConfirmationPageState &
  BookingFlowState;
