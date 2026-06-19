import { searchRoutesClientService } from "@/modules/route-search/services/route-search.client.service";
import type { SearchRoute, SearchRoutesRequest } from "@/types/search-routes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type FetchSearchRoutesArgs = {
  locale: string;
  request: SearchRoutesRequest;
};

type SearchRoutesState = {
  request?: SearchRoutesRequest;
  routes?: SearchRoute[];
  error?: string;
  isPending: boolean;
};

const initialState: SearchRoutesState = {
  isPending: false,
};

export const fetchSearchRoutes = createAsyncThunk<
  SearchRoute[],
  FetchSearchRoutesArgs,
  { rejectValue: string }
>("searchRoutes/fetch", async ({ locale, request }, thunkApi) => {
  try {
    return await searchRoutesClientService({ locale, request });
  } catch (error) {
    return thunkApi.rejectWithValue(
      error instanceof Error ? error.message : "Unable to search routes",
    );
  }
});

const searchRoutesSlice = createSlice({
  name: "searchRoutes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchRoutes.pending, (state, action) => {
        state.request = action.meta.arg.request;
        state.routes = undefined;
        state.error = undefined;
        state.isPending = true;
      })
      .addCase(fetchSearchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload;
        state.isPending = false;
      })
      .addCase(fetchSearchRoutes.rejected, (state, action) => {
        state.routes = undefined;
        state.error =
          action.payload ?? action.error.message ?? "Unable to search routes";
        state.isPending = false;
      });
  },
});

export default searchRoutesSlice.reducer;
