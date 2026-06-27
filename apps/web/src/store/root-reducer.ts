import { combineReducers } from "@reduxjs/toolkit";
import { bookingReducer } from "@/features/booking/store/booking.slice";
import { jsonPlaceholderDemoReducer } from "./slices/jsonplaceholder-demo.slice";
import { labelsReducer } from "./slices/labels.slice";

export const rootReducer = combineReducers({
  booking: bookingReducer,
  jsonPlaceholderDemo: jsonPlaceholderDemoReducer,
  labels: labelsReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;
