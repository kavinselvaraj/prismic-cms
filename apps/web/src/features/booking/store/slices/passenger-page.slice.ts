import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  FlightSearchState,
  PassengerName,
  PassengerPageState,
} from "../../types/booking.types";
import { createPassengerDrafts } from "../../utils/booking.helpers";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setFlightSearchData } from "./flight-search-page.slice";

const initialState: PassengerPageState = {
  passengerNames: [],
};

const passengerPageSlice = createSlice({
  name: "bookingPassengerPage",
  initialState,
  reducers: {
    initializePassengersFromSearch(
      state,
      action: PayloadAction<FlightSearchState>,
    ) {
      state.passengerNames = createPassengerDrafts(action.payload);
    },
    setPassengerNames(state, action: PayloadAction<PassengerName[]>) {
      state.passengerNames = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(hydrateBookingState, (_state, action) => ({
        passengerNames: action.payload.passengerNames,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { initializePassengersFromSearch, setPassengerNames } =
  passengerPageSlice.actions;

export const passengerPageReducer = passengerPageSlice.reducer;
