import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  ConfirmationPageState,
  CreateBookingRequest,
} from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import {
  setAncillarySelection,
  setSeatSelection,
  setServiceSelection,
} from "./ancillary-services-page.slice";
import {
  setCustomerInformation,
  updateCustomerInformation,
} from "./customer-information-page.slice";
import { setFlightSearchData } from "./flight-search-page.slice";
import { setBundleSelection } from "./package-selection-page.slice";
import { setPassengerNames } from "./passenger-page.slice";

const initialState: ConfirmationPageState = {
  confirmationPayload: null,
};

const confirmationPageSlice = createSlice({
  name: "bookingConfirmationPage",
  initialState,
  reducers: {
    buildConfirmationPayload(
      state,
      action: PayloadAction<CreateBookingRequest>,
    ) {
      state.confirmationPayload = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(setPassengerNames, () => initialState)
      .addCase(setBundleSelection, () => initialState)
      .addCase(setSeatSelection, () => initialState)
      .addCase(setAncillarySelection, () => initialState)
      .addCase(setServiceSelection, () => initialState)
      .addCase(setCustomerInformation, () => initialState)
      .addCase(updateCustomerInformation, () => initialState)
      .addCase(hydrateBookingState, (_state, action) => ({
        confirmationPayload: action.payload.confirmationPayload,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { buildConfirmationPayload } = confirmationPageSlice.actions;

export const confirmationPageReducer = confirmationPageSlice.reducer;
