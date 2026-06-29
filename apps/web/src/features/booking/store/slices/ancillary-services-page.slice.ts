import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  AncillaryServicesPageState,
  PassengerAncillarySelectionState,
  PassengerSeatSelectionState,
  PassengerServiceSelectionState,
} from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setFlightSearchData } from "./flight-search-page.slice";

const initialState: AncillaryServicesPageState = {
  ancillaries: [],
  seats: [],
  services: [],
};

const ancillaryServicesPageSlice = createSlice({
  name: "bookingAncillaryServicesPage",
  initialState,
  reducers: {
    setAncillarySelection(
      state,
      action: PayloadAction<PassengerAncillarySelectionState[]>,
    ) {
      state.ancillaries = action.payload;
    },
    setSeatSelection(
      state,
      action: PayloadAction<PassengerSeatSelectionState[]>,
    ) {
      state.seats = action.payload;
    },
    setServiceSelection(
      state,
      action: PayloadAction<PassengerServiceSelectionState[]>,
    ) {
      state.services = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(hydrateBookingState, (_state, action) => ({
        ancillaries: action.payload.ancillaries,
        seats: action.payload.seats,
        services: action.payload.services,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { setAncillarySelection, setSeatSelection, setServiceSelection } =
  ancillaryServicesPageSlice.actions;

export const ancillaryServicesPageReducer = ancillaryServicesPageSlice.reducer;
