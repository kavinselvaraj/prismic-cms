import { createAction } from "@reduxjs/toolkit";
import type { BookingState } from "../types/booking.types";

export const hydrateBookingState = createAction<BookingState>(
  "booking/hydrateBookingState",
);

export const resetBooking = createAction("booking/resetBooking");
