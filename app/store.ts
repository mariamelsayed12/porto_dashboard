import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import {  VillageApiSlice } from "./services/crudVillage";
import { propertyApiSlice } from "./services/crudproperties";
import { DashboardOverviewApiSlice } from "./services/DashboardOverview";
import networkReducer from "./feature/NetworkSlice";


export const store = configureStore({
  reducer: {
    [VillageApiSlice.reducerPath]: VillageApiSlice.reducer,
    [propertyApiSlice.reducerPath]: propertyApiSlice.reducer,
    [DashboardOverviewApiSlice.reducerPath]: DashboardOverviewApiSlice.reducer,
    network: networkReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      VillageApiSlice.middleware,
      propertyApiSlice.middleware,
      DashboardOverviewApiSlice.middleware
    ),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;