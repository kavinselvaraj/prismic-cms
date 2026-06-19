import { configureStore } from "@reduxjs/toolkit";
import searchRoutesReducer from "@/modules/route-search/store/route-search.slice";

export const store = configureStore({
  reducer: {
    searchRoutes: searchRoutesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
