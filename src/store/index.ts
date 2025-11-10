import { CartItemType } from "@/utils/modelTypes";
import { configureStore } from "@reduxjs/toolkit";
import { generateReducer } from "./common/action-reducer";
import authReducer from "./features/authSlice";
import loadingReducer from "./features/loadingSlice";
import cartReducer from "./features/localCartSlice";
import { cartApi } from "./services/cartApi";
import { categoryApi } from "./services/categoryApi";
import { orderApi } from "./services/orderApi";
import { productApi } from "./services/productApi";
import { wishlistApi } from "./services/wishlistAPi";
export const makeStore = () =>
  configureStore({
    reducer: {
      // Add API reducer when you create it
      [productApi.reducerPath]: productApi.reducer,
      [categoryApi.reducerPath]: categoryApi.reducer,
      [cartApi.reducerPath]: cartApi.reducer,
      [orderApi.reducerPath]: orderApi.reducer,
      [wishlistApi.reducerPath]: wishlistApi.reducer,
      localCart: cartReducer,
      auth: authReducer,
      loading: loadingReducer,
      selectedCart: generateReducer<CartItemType[]>("selectedCart").reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        productApi.middleware,
        categoryApi.middleware,
        cartApi.middleware,
        orderApi.middleware,
        wishlistApi.middleware
      ), // Add API middleware(),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
