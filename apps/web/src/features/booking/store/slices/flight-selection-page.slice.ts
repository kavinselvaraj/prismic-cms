import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  FlightSelectionPageState,
  SelectedFlight,
} from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setFlightSearchData } from "./flight-search-page.slice";

const initialState: FlightSelectionPageState = {
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
};

const flightSelectionPageSlice = createSlice({
  name: "bookingFlightSelectionPage",
  initialState,
  reducers: {
    setSelectedOutboundFlight(state, action: PayloadAction<SelectedFlight>) {
      state.selectedOutboundFlight = action.payload;
    },
    setSelectedReturnFlight(
      state,
      action: PayloadAction<SelectedFlight | null>,
    ) {
      state.selectedReturnFlight = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(hydrateBookingState, (_state, action) => ({
        selectedOutboundFlight: action.payload.selectedOutboundFlight,
        selectedReturnFlight: action.payload.selectedReturnFlight,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { setSelectedOutboundFlight, setSelectedReturnFlight } =
  flightSelectionPageSlice.actions;

export const flightSelectionPageReducer = flightSelectionPageSlice.reducer;
