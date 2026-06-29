import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  FlightSearchPageState,
  FlightSearchState,
} from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";

const initialState: FlightSearchPageState = {
  search: null,
};

const flightSearchPageSlice = createSlice({
  name: "bookingFlightSearchPage",
  initialState,
  reducers: {
    setFlightSearchData(state, action: PayloadAction<FlightSearchState>) {
      state.search = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateBookingState, (_state, action) => ({
        search: action.payload.search,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { setFlightSearchData } = flightSearchPageSlice.actions;

export const flightSearchPageReducer = flightSearchPageSlice.reducer;
