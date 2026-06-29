import { createSlice } from "@reduxjs/toolkit";
import type { BookingFlowState } from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setAncillarySelection } from "./ancillary-services-page.slice";
import { buildConfirmationPayload } from "./confirmation-page.slice";
import { initializeCustomerInformationFromPassengers } from "./customer-information-page.slice";
import { setFlightSearchData } from "./flight-search-page.slice";
import { setBundleSelection } from "./package-selection-page.slice";
import {
  initializePassengersFromSearch,
  setPassengerNames,
} from "./passenger-page.slice";

const initialState: BookingFlowState = {
  currentStep: "FLIGHT_SEARCH",
};

const bookingFlowSlice = createSlice({
  name: "bookingFlow",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => ({
        currentStep: "FLIGHT_SELECTION" as const,
      }))
      .addCase(initializePassengersFromSearch, () => ({
        currentStep: "FLIGHT_SELECTION" as const,
      }))
      .addCase(setPassengerNames, () => ({
        currentStep: "PACKAGE_SELECTION" as const,
      }))
      .addCase(setBundleSelection, () => ({
        currentStep: "ANCILLARY_SERVICES" as const,
      }))
      .addCase(setAncillarySelection, () => ({
        currentStep: "CUSTOMER_INFORMATION" as const,
      }))
      .addCase(initializeCustomerInformationFromPassengers, () => ({
        currentStep: "CUSTOMER_INFORMATION" as const,
      }))
      .addCase(buildConfirmationPayload, () => ({
        currentStep: "CONFIRMATION" as const,
      }))
      .addCase(hydrateBookingState, (_state, action) => ({
        currentStep: action.payload.currentStep,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const bookingFlowReducer = bookingFlowSlice.reducer;
