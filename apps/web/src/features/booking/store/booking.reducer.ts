import type { AnyAction, Reducer } from "@reduxjs/toolkit";
import type { BookingState } from "../types/booking.types";
import { ancillaryServicesPageReducer } from "./slices/ancillary-services-page.slice";
import { bookingFlowReducer } from "./slices/booking-flow.slice";
import { confirmationPageReducer } from "./slices/confirmation-page.slice";
import { customerInformationPageReducer } from "./slices/customer-information-page.slice";
import { flightSearchPageReducer } from "./slices/flight-search-page.slice";
import { flightSelectionPageReducer } from "./slices/flight-selection-page.slice";
import { packageSelectionPageReducer } from "./slices/package-selection-page.slice";
import { passengerPageReducer } from "./slices/passenger-page.slice";

export const bookingReducer: Reducer<BookingState, AnyAction> = (
  state,
  action,
) => {
  const flightSearchState = flightSearchPageReducer(
    state ? { search: state.search } : undefined,
    action,
  );
  const flightSelectionState = flightSelectionPageReducer(
    state
      ? {
          selectedOutboundFlight: state.selectedOutboundFlight,
          selectedReturnFlight: state.selectedReturnFlight,
        }
      : undefined,
    action,
  );
  const passengerState = passengerPageReducer(
    state ? { passengerNames: state.passengerNames } : undefined,
    action,
  );
  const packageSelectionState = packageSelectionPageReducer(
    state ? { bundles: state.bundles } : undefined,
    action,
  );
  const ancillaryServicesState = ancillaryServicesPageReducer(
    state
      ? {
          ancillaries: state.ancillaries,
          seats: state.seats,
          services: state.services,
        }
      : undefined,
    action,
  );
  const customerInformationState = customerInformationPageReducer(
    state ? { customerInformation: state.customerInformation } : undefined,
    action,
  );
  const confirmationState = confirmationPageReducer(
    state ? { confirmationPayload: state.confirmationPayload } : undefined,
    action,
  );
  const bookingFlowState = bookingFlowReducer(
    state ? { currentStep: state.currentStep } : undefined,
    action,
  );

  return {
    ...ancillaryServicesState,
    ...packageSelectionState,
    ...confirmationState,
    ...customerInformationState,
    ...passengerState,
    ...flightSearchState,
    ...flightSelectionState,
    ...bookingFlowState,
  };
};
