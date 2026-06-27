"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { hydrateBookingState } from "@/features/booking/store/booking.slice";
import { makeStore, type AppStore } from "./index";
import { loadPersistedStoreState, persistStoreState } from "./persist";
import { hydrateJsonPlaceholderDemoState } from "./slices/jsonplaceholder-demo.slice";
import { hydrateLabelsState } from "./slices/labels.slice";

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);
  const hasHydratedRef = useRef(false);

  if (!storeRef.current) {
    const store = makeStore();
    store.subscribe(() => {
      if (!hasHydratedRef.current) {
        return;
      }

      persistStoreState(store.getState());
    });

    storeRef.current = store;
  }

  useEffect(() => {
    const persistedStoreState = loadPersistedStoreState();

    if (persistedStoreState?.booking && storeRef.current) {
      storeRef.current.dispatch(hydrateBookingState(persistedStoreState.booking));
    }

    if (persistedStoreState?.labels && storeRef.current) {
      storeRef.current.dispatch(hydrateLabelsState(persistedStoreState.labels));
    }

    if (persistedStoreState?.jsonPlaceholderDemo && storeRef.current) {
      storeRef.current.dispatch(
        hydrateJsonPlaceholderDemoState(
          persistedStoreState.jsonPlaceholderDemo,
        ),
      );
    }

    hasHydratedRef.current = true;
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
