import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type {
  CustomerInformationPageState,
  CustomerInformationState,
  PassengerName,
} from "../../types/booking.types";
import { createCustomerInformationFromPassenger } from "../../utils/booking.helpers";
import { hydrateBookingState, resetBooking } from "../booking.actions";
import { setFlightSearchData } from "./flight-search-page.slice";
import { setPassengerNames } from "./passenger-page.slice";

const initialState: CustomerInformationPageState = {
  customerInformation: [],
};

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

function buildCustomerInformation(passengers: PassengerName[]) {
  return passengers.map((passenger) =>
    createCustomerInformationFromPassenger(passenger),
  );
}

const customerInformationPageSlice = createSlice({
  name: "bookingCustomerInformationPage",
  initialState,
  reducers: {
    initializeCustomerInformationFromPassengers(
      state,
      action: PayloadAction<PassengerName[]>,
    ) {
      for (const passenger of action.payload) {
        const existingCustomer = state.customerInformation.find(
          (customer) => customer.passengerId === passenger.id,
        );

        upsertCustomerInformation(
          state.customerInformation,
          existingCustomer ?? createCustomerInformationFromPassenger(passenger),
        );
      }
    },
    setCustomerInformation(
      state,
      action: PayloadAction<CustomerInformationState[]>,
    ) {
      state.customerInformation = action.payload;
    },
    updateCustomerInformation(
      state,
      action: PayloadAction<CustomerInformationState>,
    ) {
      upsertCustomerInformation(state.customerInformation, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFlightSearchData, () => initialState)
      .addCase(setPassengerNames, (state, action) => {
        state.customerInformation = buildCustomerInformation(action.payload);
      })
      .addCase(hydrateBookingState, (_state, action) => ({
        customerInformation: action.payload.customerInformation,
      }))
      .addCase(resetBooking, () => initialState);
  },
});

export const {
  initializeCustomerInformationFromPassengers,
  setCustomerInformation,
  updateCustomerInformation,
} = customerInformationPageSlice.actions;

export const customerInformationPageReducer =
  customerInformationPageSlice.reducer;
