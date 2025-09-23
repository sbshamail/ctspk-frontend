import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./services/product";
export const store = configureStore({
  reducer: {
    // Add API reducer when you create it
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productApi.middleware), // Add API middleware(),
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
