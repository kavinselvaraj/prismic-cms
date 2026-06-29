import type { RootState } from "@/store";
import {
  hasBundleSelectionForPassengers,
  hasCustomerInformation,
  hasSelectedRequiredFlights,
  isRoundTrip,
} from "../utils/booking.helpers";

export const selectBookingState = (state: RootState) => state.booking;

export const selectFlightSearch = (state: RootState) => state.booking.search;

export const selectSelectedOutboundFlight = (state: RootState) =>
  state.booking.selectedOutboundFlight;

export const selectSelectedReturnFlight = (state: RootState) =>
  state.booking.selectedReturnFlight;

export const selectPassengerNames = (state: RootState) =>
  state.booking.passengerNames;

export const selectBundleSelection = (state: RootState) =>
  state.booking.bundles;

export const selectSeatSelection = (state: RootState) => state.booking.seats;

export const selectAncillarySelection = (state: RootState) =>
  state.booking.ancillaries;

export const selectServiceSelection = (state: RootState) =>
  state.booking.services;

export const selectCustomerInformation = (state: RootState) =>
  state.booking.customerInformation;

export const selectConfirmationPayload = (state: RootState) =>
  state.booking.confirmationPayload;

export const selectIsRoundTripBooking = (state: RootState) =>
  isRoundTrip(state.booking.search);

export const selectCanAccessFlightSelection = (state: RootState) =>
  Boolean(state.booking.search);

export const selectCanAccessPackageSelection = (state: RootState) =>
  hasSelectedRequiredFlights(
    state.booking.search,
    state.booking.selectedOutboundFlight,
    state.booking.selectedReturnFlight,
  ) && state.booking.passengerNames.length > 0;

export const selectCanAccessAncillaryServices = (state: RootState) =>
  hasBundleSelectionForPassengers(state.booking);

export const selectCanAccessCustomerInformation = (state: RootState) =>
  state.booking.passengerNames.length > 0 &&
  hasBundleSelectionForPassengers(state.booking);

export const selectCanAccessConfirmation = (state: RootState) =>
  selectCanAccessCustomerInformation(state) &&
  hasCustomerInformation(state.booking);
