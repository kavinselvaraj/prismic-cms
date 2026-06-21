"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppLocale } from "./routing";
import type { FlightMessages } from "./messages";

type LabelsApiResponse = {
  locale: AppLocale;
  messages: FlightMessages;
  source: "local" | "prismic";
  version: string;
};

type LabelsState = {
  error: string | null;
  isLoading: boolean;
  messages: FlightMessages | null;
};

export function useLabelMessages(locale: AppLocale) {
  const [state, setState] = useState<LabelsState>({
    error: null,
    isLoading: true,
    messages: null,
  });
  const storageKey = useMemo(() => `ibe-labels:${locale}`, [locale]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        const cachedValue = window.localStorage.getItem(storageKey);
        let cachedResponse: LabelsApiResponse | null = null;

        if (cachedValue) {
          cachedResponse = JSON.parse(cachedValue) as LabelsApiResponse;
          console.log("[labels-cache] localStorage HIT", {
            locale,
            source: cachedResponse.source,
            storageKey,
          });

          if (isActive) {
            setState({
              error: null,
              isLoading: false,
              messages: cachedResponse.messages,
            });
          }
        } else {
          console.log("[labels-cache] localStorage MISS", {
            locale,
            storageKey,
          });
        }

        console.log("[labels-cache] FETCH /api/labels", {
          locale,
        });

        const response = await fetch(`/api/labels/${locale}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Labels request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as LabelsApiResponse;
        const hasLabelChanges = cachedResponse?.version !== payload.version;

        console.log("[labels-cache] API RESPONSE", {
          locale,
          source: payload.source,
          hasLabelChanges,
          version: payload.version,
        });

        window.localStorage.setItem(storageKey, JSON.stringify(payload));

        console.log("[labels-cache] SAVED localStorage", {
          locale,
          source: payload.source,
          storageKey,
        });

        if (isActive && (!cachedResponse || hasLabelChanges)) {
          setState({
            error: null,
            isLoading: false,
            messages: payload.messages,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load labels";

        console.error("[labels-cache] LOAD ERROR", {
          locale,
          message,
        });

        if (isActive) {
          setState({
            error: message,
            isLoading: false,
            messages: null,
          });
        }
      }
    }

    setState({
      error: null,
      isLoading: true,
      messages: null,
    });

    void load();

    return () => {
      isActive = false;
    };
  }, [locale, storageKey]);

  return state;
}
