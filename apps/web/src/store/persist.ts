"use client";

import type { RootReducerState } from "./root-reducer";

const STORE_PERSIST_KEY = "ibe:store";

export function loadPersistedStoreState() {
  try {
    const storedValue = window.localStorage.getItem(STORE_PERSIST_KEY);

    if (!storedValue) {
      return undefined;
    }

    return JSON.parse(storedValue) as Partial<RootReducerState>;
  } catch {
    return undefined;
  }
}

export function persistStoreState(state: RootReducerState) {
  const persistedState: Partial<RootReducerState> = {
    labels: state.labels,
  };

  window.localStorage.setItem(
    STORE_PERSIST_KEY,
    JSON.stringify(persistedState),
  );
}
