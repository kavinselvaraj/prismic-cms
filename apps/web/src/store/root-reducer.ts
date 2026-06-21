import { combineReducers } from "@reduxjs/toolkit";
import { labelsReducer } from "./slices/labels.slice";

export const rootReducer = combineReducers({
  labels: labelsReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;
