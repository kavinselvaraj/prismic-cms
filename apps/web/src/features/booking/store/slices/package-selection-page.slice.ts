import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  PackageSelectionPageState,
  PassengerBundleSelectionState,
} from "../../types/booking.types";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setFlightSearchData } from "./flight-search-page.slice";

const initialState: PackageSelectionPageState = {
  bundles: [],
};

function upsertByPassengerAndSegment(
  items: PassengerBundleSelectionState[],
  nextItem: PassengerBundleSelectionState,
) {
  const existingIndex = items.findIndex(
    (item) =>
      item.passengerId === nextItem.passengerId &&
      item.segmentType === nextItem.segmentType,
  );

  if (existingIndex >= 0) {
    items[existingIndex] = nextItem;
    return;
  }

  items.push(nextItem);
}

const packageSelectionPageSlice = createSlice({
  name: "bookingPackageSelectionPage",
  initialState,
  reducers: {
    setBundleSelection(
      state,
      action: PayloadAction<PassengerBundleSelectionState[]>,
    ) {
      state.bundles = action.payload;
    },
    upsertBundleSelection(
      state,
      action: PayloadAction<PassengerBundleSelectionState>,
    ) {
      upsertByPassengerAndSegment(state.bundles, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(hydrateBookingState, (_state, action) => ({
        bundles: action.payload.bundles,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const { setBundleSelection, upsertBundleSelection } =
  packageSelectionPageSlice.actions;

export const packageSelectionPageReducer = packageSelectionPageSlice.reducer;
