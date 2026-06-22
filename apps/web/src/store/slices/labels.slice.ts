"use client";

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { FlightMessages } from "@/i18n/messages";
import type { AppLocale } from "@/i18n/routing";

export type LabelsApiResponse = {
  locale: AppLocale;
  messages: FlightMessages;
  source: "local" | "prismic" | "backend";
  version: string;
};

type LocaleLabelsState = {
  loaded: boolean;
  messages: FlightMessages | null;
  source: "local" | "prismic" | "backend" | null;
  version: string | null;
  lastFetchedAt: number | null;
};

export type LabelsState = {
  activeLocale: AppLocale | null;
  byLocale: Partial<Record<AppLocale, LocaleLabelsState>>;
  error: string | null;
  loading: boolean;
};

const initialLocaleState: LocaleLabelsState = {
  loaded: false,
  messages: null,
  source: null,
  version: null,
  lastFetchedAt: null,
};

const initialState: LabelsState = {
  activeLocale: null,
  byLocale: {},
  error: null,
  loading: true,
};

export const ensureLabelsLoaded = createAsyncThunk<
  LabelsApiResponse,
  AppLocale,
  { rejectValue: string; state: RootState }
>(
  "labels/ensureLoaded",
  async (locale, thunkApi) => {
    try {
      const response = await fetch(`/api/labels/${locale}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Labels request failed with status ${response.status}`);
      }

      return (await response.json()) as LabelsApiResponse;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error instanceof Error ? error.message : "Unable to load labels",
      );
    }
  },
  {
    condition: (locale, { getState }) => {
      const existingLabels = selectLabelsEntry(getState() as RootState, locale);

      return !(
        existingLabels.loaded &&
        existingLabels.messages &&
        existingLabels.version
      );
    },
  },
);

const labelsSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    clearLabelsForLocale(state, action: PayloadAction<AppLocale>) {
      state.byLocale[action.payload] = {
        ...initialLocaleState,
      };
    },
    setActiveLocale(state, action: PayloadAction<AppLocale>) {
      state.activeLocale = action.payload;
    },
    hydrateLabelsState(_, action: PayloadAction<LabelsState>) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ensureLabelsLoaded.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.activeLocale = action.meta.arg;
      })
      .addCase(ensureLabelsLoaded.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.activeLocale = action.payload.locale;
        state.byLocale[action.payload.locale] = {
          loaded: true,
          messages: action.payload.messages,
          source: action.payload.source,
          version: action.payload.version,
          lastFetchedAt: Date.now(),
        };
      })
      .addCase(ensureLabelsLoaded.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to load labels";
      });
  },
});

export const { clearLabelsForLocale, hydrateLabelsState, setActiveLocale } =
  labelsSlice.actions;
export const labelsReducer = labelsSlice.reducer;

export function selectLabelsEntry(state: RootState, locale: AppLocale) {
  return state.labels.byLocale[locale] ?? initialLocaleState;
}

export function selectLabelsMessages(state: RootState, locale: AppLocale) {
  return selectLabelsEntry(state, locale).messages;
}

export function selectLabelsLoading(state: RootState) {
  return state.labels.loading;
}

export function selectLabelsError(state: RootState) {
  return state.labels.error;
}
