"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { loadPersistedStoreState, persistStoreState } from "./persist";
import { hydrateLabelsState } from "./slices/labels.slice";

type StoreProviderProps = {
  children: ReactNode;
};

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);
  const hasHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

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

    if (persistedStoreState?.labels && storeRef.current) {
      storeRef.current.dispatch(hydrateLabelsState(persistedStoreState.labels));
    }

    hasHydratedRef.current = true;
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
