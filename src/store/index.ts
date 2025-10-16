import { configureStore } from "@reduxjs/toolkit";
import { generateReducer } from "./common/action-reducer";
import authReducer from "./features/authSlice";
import loadingReducer from "./features/loadingSlice";
import cartReducer from "./features/localCartSlice";
import { cartApi } from "./services/cartApi";
import { categoryApi } from "./services/categoryApi";
import { productApi } from "./services/productApi";
export const makeStore = () =>
  configureStore({
    reducer: {
      // Add API reducer when you create it
      [productApi.reducerPath]: productApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
      [cartApi.reducerPath]: cartApi.reducer,
      localCart: cartReducer,
      auth: authReducer,
      loading: loadingReducer,
      selectedCart: generateReducer<[]>("selectedCart").reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        productApi.middleware,
        categoryApi.middleware,
        cartApi.middleware
      ), // Add API middleware(),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
