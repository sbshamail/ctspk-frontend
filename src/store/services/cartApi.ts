import { CartItem } from "@/lib/cartService";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/cart`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.data?.access_token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // ---------- GET CART ----------
    getCart: builder.query<any, void>({
      query: () => "/list",
      providesTags: ["Cart"],
      transformResponse: (res: any) => res.data ?? [], // keep only array
    }),
    // ---------- ADD CART ----------
    addToCart: builder.mutation({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const newItem = res?.data;
          // Patch local cache of getCart
          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex(
                (i: CartItem) => i.product.id === newItem.product.id
              );
              if (idx >= 0) draft[idx] = newItem;
              else draft.push(newItem);
            })
          );
        } catch {}
      },
    }),
    updateCart: builder.mutation({
      query: ({ product_id, quantity }) => ({
        url: `/update/${product_id}`,
        method: "PUT",
        body: { quantity },
      }),
      async onQueryStarted({ product_id }, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const updatedItem = res?.data;
          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex(
                (i: CartItem) => i.product.id === updatedItem.product.id
              );
              if (idx >= 0) draft[idx] = updatedItem;
            })
          );
        } catch {}
      },
    }),
    removeCart: builder.mutation({
      query: (product_id) => ({
        url: `/delete/${product_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: `/delete-all`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveCartMutation,
  useClearCartMutation,
} = cartApi;
