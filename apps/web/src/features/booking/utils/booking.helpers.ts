import { bundleOptions } from "../data/booking.mock";
import type {
  BookingState,
  CreateBookingRequest,
  CustomerInformationState,
  FlightItemBaseRequest,
  PassengerName,
  PassengerType,
  SegmentType,
  SelectedFlight,
  SelectedFlightRequest,
  FlightSearchState,
} from "../types/booking.types";

export function getTotalPassengerCount(search: FlightSearchState | null): number {
  if (!search) {
    return 0;
  }

  return search.passengers.ADT + search.passengers.CHD + search.passengers.INF;
}

export function createPassengerDrafts(search: FlightSearchState): PassengerName[] {
  const passengerTypes: PassengerType[] = [
    ...Array.from({ length: search.passengers.ADT }, () => "ADT" as const),
    ...Array.from({ length: search.passengers.CHD }, () => "CHD" as const),
    ...Array.from({ length: search.passengers.INF }, () => "INF" as const),
  ];

  return passengerTypes.map((type, index) => ({
    associatedAdultId: undefined,
    firstName: "",
    id: index + 1,
    lastName: "",
    type,
  }));
}

export function createCustomerInformationFromPassenger(
  passenger: PassengerName,
): CustomerInformationState {
  return {
    contactInformation: {
      countryCode: "+65",
      email: "",
      phoneNumber: "",
    },
    passengerId: passenger.id,
    passengerInformation: {
      firstName: passenger.firstName,
      lastName: passenger.lastName,
    },
    passportInformation: {},
  };
}

export function getFlightsBySegment(
  flights: SelectedFlight[],
  segmentType: SegmentType,
) {
  return flights.filter((flight) => flight.segmentType === segmentType);
}

export function isRoundTrip(search: FlightSearchState | null): boolean {
  return search?.tripType === "ROUND_TRIP";
}

export function hasSelectedRequiredFlights(
  search: FlightSearchState | null,
  outboundFlight: SelectedFlight | null,
  returnFlight: SelectedFlight | null,
): boolean {
  if (!search || !outboundFlight) {
    return false;
  }

  return search.tripType === "ONE_WAY" || Boolean(returnFlight);
}

export function getSelectedFlightBySegment(
  booking: BookingState,
  segmentType: SegmentType,
) {
  return segmentType === "OUTBOUND"
    ? booking.selectedOutboundFlight
    : booking.selectedReturnFlight;
}

export function getRequiredSegments(search: FlightSearchState | null): SegmentType[] {
  return search?.tripType === "ROUND_TRIP" ? ["OUTBOUND", "RETURN"] : ["OUTBOUND"];
}

export function hasBundleSelectionForPassengers(booking: BookingState): boolean {
  if (!booking.search || booking.passengerNames.length === 0) {
    return false;
  }

  const requiredSegments = getRequiredSegments(booking.search);
  return booking.passengerNames.every((passenger) =>
    requiredSegments.every((segmentType) =>
      booking.bundles.some(
        (bundle) =>
          bundle.passengerId === passenger.id &&
          bundle.segmentType === segmentType,
      ),
    ),
  );
}

export function hasCustomerInformation(booking: BookingState): boolean {
  return (
    booking.passengerNames.length > 0 &&
    booking.passengerNames.every((passenger) =>
      booking.customerInformation.some(
        (customer) => customer.passengerId === passenger.id,
      ),
    )
  );
}

export function toSelectedFlightRequest(
  flight: SelectedFlight,
): SelectedFlightRequest {
  return {
    arrivalDateTime: flight.arrivalDateTime,
    departureDateTime: flight.departureDateTime,
    destination: flight.destination,
    flightId: flight.flightId,
    flightNumber: flight.flightNumber,
    lfid: flight.lfid,
    origin: flight.origin,
    pfid: flight.pfid,
    price: flight.price,
  };
}

function toFlightItemRequest(item: FlightItemBaseRequest) {
  return {
    lfid: item.lfid,
    pfid: item.pfid,
  };
}

export function buildCreateBookingRequest(
  booking: BookingState,
): CreateBookingRequest {
  if (!booking.search || !booking.selectedOutboundFlight) {
    throw new Error("Booking is missing search or outbound flight data");
  }

  if (booking.search.tripType === "ROUND_TRIP" && !booking.selectedReturnFlight) {
    throw new Error("Round-trip booking is missing return flight data");
  }

  return {
    passengers: booking.passengerNames.map((passenger) => {
      const customer = booking.customerInformation.find(
        (entry) => entry.passengerId === passenger.id,
      );

      return {
        ancillaries: booking.ancillaries
          .filter((item) => item.passengerId === passenger.id)
          .map((item) => ({
            ...toFlightItemRequest(item),
            code: item.code,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        bundles: booking.bundles
          .filter((item) => item.passengerId === passenger.id)
          .map((item) => {
            const bundle = bundleOptions.find((option) => option.code === item.code);
            return {
              ...toFlightItemRequest(item),
              code: item.code,
              name: bundle?.name ?? item.name,
              price: bundle?.price ?? item.price,
            };
          }),
        contactInformation: customer?.contactInformation,
        passengerId: passenger.id,
        passengerInformation: {
          associatedAdultId: passenger.associatedAdultId,
          dateOfBirth: customer?.passengerInformation.dateOfBirth,
          firstName: customer?.passengerInformation.firstName ?? passenger.firstName,
          gender: customer?.passengerInformation.gender,
          lastName: customer?.passengerInformation.lastName ?? passenger.lastName,
          nationality: customer?.passengerInformation.nationality,
        },
        passengerType: passenger.type,
        passportInformation: customer?.passportInformation,
        seats: booking.seats
          .filter((item) => item.passengerId === passenger.id)
          .map((item) => ({
            ...toFlightItemRequest(item),
            price: item.price,
            seatNumber: item.seatNumber,
          })),
        services: booking.services
          .filter((item) => item.passengerId === passenger.id)
          .map((item) => ({
            ...toFlightItemRequest(item),
            chargeable: item.chargeable,
            code: item.code,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            serviceType: item.serviceType,
          })),
      };
    }),
    search: {
      departureAirport: booking.search.departureAirport,
      departureDate: booking.search.departureDate,
      destinationAirport: booking.search.destinationAirport,
      passengers: booking.search.passengers,
      returnDate: booking.search.returnDate,
    },
    selectedFlights: {
      outbound: toSelectedFlightRequest(booking.selectedOutboundFlight),
      return: booking.selectedReturnFlight
        ? toSelectedFlightRequest(booking.selectedReturnFlight)
        : undefined,
    },
    tripType: booking.search.tripType,
  };
}
