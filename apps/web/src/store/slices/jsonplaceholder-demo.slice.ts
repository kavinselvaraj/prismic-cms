"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  createEmptyJsonPlaceholderDemoEntry,
  createEmptyJsonPlaceholderDemoState,
  type JsonPlaceholderDemoData,
  type JsonPlaceholderDemoSource,
  type JsonPlaceholderDemoState,
} from "@/lib/jsonplaceholder-demo";

type SetDemoLoadingPayload = {
  source: JsonPlaceholderDemoSource;
};

type SetDemoDataPayload = {
  data: JsonPlaceholderDemoData;
  source: JsonPlaceholderDemoSource;
};

type SetDemoErrorPayload = {
  error: string;
  source: JsonPlaceholderDemoSource;
};

const initialState = createEmptyJsonPlaceholderDemoState();

const jsonPlaceholderDemoSlice = createSlice({
  name: "jsonPlaceholderDemo",
  initialState,
  reducers: {
    hydrateJsonPlaceholderDemoState(
      _state,
      action: PayloadAction<JsonPlaceholderDemoState>,
    ) {
      return action.payload;
    },
    setJsonPlaceholderDemoLoading(
      state,
      action: PayloadAction<SetDemoLoadingPayload>,
    ) {
      const entry = state[action.payload.source];
      entry.status = "loading";
      entry.error = null;
    },
    setJsonPlaceholderDemoData(
      state,
      action: PayloadAction<SetDemoDataPayload>,
    ) {
      const entry = state[action.payload.source];
      entry.data = action.payload.data;
      entry.error = null;
      entry.loadedAt = Date.now();
      entry.status = "ready";
      state.lastUpdatedSource = action.payload.source;
    },
    setJsonPlaceholderDemoError(
      state,
      action: PayloadAction<SetDemoErrorPayload>,
    ) {
      const entry = state[action.payload.source];
      entry.error = action.payload.error;
      entry.status = "error";
      state.lastUpdatedSource = action.payload.source;
    },
  },
});

export const {
  hydrateJsonPlaceholderDemoState,
  setJsonPlaceholderDemoData,
  setJsonPlaceholderDemoError,
  setJsonPlaceholderDemoLoading,
} = jsonPlaceholderDemoSlice.actions;

export const jsonPlaceholderDemoReducer = jsonPlaceholderDemoSlice.reducer;

export function selectJsonPlaceholderDemoEntry(
  state: RootState,
  source: JsonPlaceholderDemoSource,
) {
  return state.jsonPlaceholderDemo[source] ?? createEmptyJsonPlaceholderDemoEntry();
}

export function selectJsonPlaceholderCsrDemoEntry(state: RootState) {
  return selectJsonPlaceholderDemoEntry(state, "csr");
}

export function selectJsonPlaceholderSsrDemoEntry(state: RootState) {
  return selectJsonPlaceholderDemoEntry(state, "ssr");
}
