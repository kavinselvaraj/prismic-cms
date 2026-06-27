import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BookingState,
  CreateBookingRequest,
  CustomerInformationState,
  PassengerAncillarySelectionState,
  PassengerBundleSelectionState,
  PassengerName,
  PassengerSeatSelectionState,
  PassengerServiceSelectionState,
  SelectedFlight,
  FlightSearchState,
} from "../types/booking.types";
import {
  buildCreateBookingRequest,
  createCustomerInformationFromPassenger,
  createPassengerDrafts,
} from "../utils/booking.helpers";

const initialState: BookingState = {
  ancillaries: [],
  bundles: [],
  confirmationPayload: null,
  currentStep: "FLIGHT_SEARCH",
  customerInformation: [],
  passengerNames: [],
  search: null,
  seats: [],
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
  services: [],
};

function upsertByPassengerAndSegment<
  TItem extends { passengerId: number; segmentType: string },
>(items: TItem[], nextItem: TItem) {
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

function upsertCustomerInformation(
  customers: CustomerInformationState[],
  nextCustomer: CustomerInformationState,
) {
  const existingIndex = customers.findIndex(
    (customer) => customer.passengerId === nextCustomer.passengerId,
  );

  if (existingIndex >= 0) {
    customers[existingIndex] = nextCustomer;
    return;
  }

  customers.push(nextCustomer);
}

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    buildConfirmationPayload(state) {
      state.confirmationPayload = buildCreateBookingRequest(state);
      state.currentStep = "CONFIRMATION";
    },
    hydrateBookingState(_state, action: PayloadAction<BookingState>) {
      return action.payload;
    },
    initializeCustomerInformationFromPassengers(state) {
      for (const passenger of state.passengerNames) {
        const existingCustomer = state.customerInformation.find(
          (customer) => customer.passengerId === passenger.id,
        );

        upsertCustomerInformation(
          state.customerInformation,
          existingCustomer ?? createCustomerInformationFromPassenger(passenger),
        );
      }
      state.currentStep = "CUSTOMER_INFORMATION";
    },
    initializePassengersFromSearch(state) {
      if (!state.search) {
        return;
      }

      state.passengerNames = createPassengerDrafts(state.search);
    },
    resetBooking() {
      return initialState;
    },
    setAncillarySelection(
      state,
      action: PayloadAction<PassengerAncillarySelectionState[]>,
    ) {
      state.ancillaries = action.payload;
      state.currentStep = "CUSTOMER_INFORMATION";
    },
    setBundleSelection(
      state,
      action: PayloadAction<PassengerBundleSelectionState[]>,
    ) {
      state.bundles = action.payload;
      state.currentStep = "ANCILLARY_SERVICES";
    },
    setFlightSearchData(state, action: PayloadAction<FlightSearchState>) {
      state.search = action.payload;
      state.selectedOutboundFlight = null;
      state.selectedReturnFlight = null;
      state.passengerNames = [];
      state.bundles = [];
      state.seats = [];
      state.ancillaries = [];
      state.services = [];
      state.customerInformation = [];
      state.confirmationPayload = null;
      state.currentStep = "FLIGHT_SELECTION";
    },
    setPassengerNames(state, action: PayloadAction<PassengerName[]>) {
      state.passengerNames = action.payload;
      state.customerInformation = action.payload.map((passenger) =>
        createCustomerInformationFromPassenger(passenger),
      );
      state.currentStep = "PACKAGE_SELECTION";
    },
    setSeatSelection(state, action: PayloadAction<PassengerSeatSelectionState[]>) {
      state.seats = action.payload;
    },
    setSelectedOutboundFlight(state, action: PayloadAction<SelectedFlight>) {
      state.selectedOutboundFlight = action.payload;
    },
    setSelectedReturnFlight(state, action: PayloadAction<SelectedFlight | null>) {
      state.selectedReturnFlight = action.payload;
    },
    setServiceSelection(
      state,
      action: PayloadAction<PassengerServiceSelectionState[]>,
    ) {
      state.services = action.payload;
    },
    upsertBundleSelection(
      state,
      action: PayloadAction<PassengerBundleSelectionState>,
    ) {
      upsertByPassengerAndSegment(state.bundles, action.payload);
    },
    updateCustomerInformation(
      state,
      action: PayloadAction<CustomerInformationState>,
    ) {
      upsertCustomerInformation(state.customerInformation, action.payload);
    },
  },
});

export const {
  buildConfirmationPayload,
  hydrateBookingState,
  initializeCustomerInformationFromPassengers,
  initializePassengersFromSearch,
  resetBooking,
  setAncillarySelection,
  setBundleSelection,
  setFlightSearchData,
  setPassengerNames,
  setSeatSelection,
  setSelectedOutboundFlight,
  setSelectedReturnFlight,
  setServiceSelection,
  updateCustomerInformation,
  upsertBundleSelection,
} = bookingSlice.actions;

export const bookingReducer = bookingSlice.reducer;

export type BookingConfirmationPayload = CreateBookingRequest;
