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
    // not required for card
    // updateCart: builder.mutation({
    //   // 👇 Dummy query to satisfy RTK Query
    //   query: ({ product_id, quantity }) => ({
    //     url: `/cart/update/${product_id}`, // just placeholder
    //     method: "PUT",
    //     body: { quantity },
    //   }),

    //   // 👇 Pure Redux local update logic
    //   async onQueryStarted({ product_id, quantity }, { dispatch }) {
    //     console.log("Simulating local Redux update:", { product_id, quantity });

    //     dispatch(
    //       cartApi.util.updateQueryData("getCart", undefined, (draft) => {
    //         if (!Array.isArray(draft)) return;

    //         const idx = draft.findIndex(
    //           (i: CartItem) =>
    //             i.product.id === product_id || i.product?.id === product_id
    //         );

    //         if (idx >= 0) {
    //           // 🔥 Force new object & array reference for UI re-render
    //           const updated = { ...draft[idx], quantity };
    //           draft.splice(idx, 1, updated);
    //         }
    //       })
    //     );

    //     console.log("Redux cart updated successfully ✅");
    //   },
    // }),

    removeCart: builder.mutation({
      query: (product_id) => ({
        url: `/delete/${product_id}`,
        method: "DELETE",
      }),
      async onQueryStarted(product_id, { dispatch, queryFulfilled }) {
        // Optimistic remove
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            return draft.filter((i: CartItem) => i.product.id !== product_id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo(); // rollback on failure
        }
      },
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
  useRemoveCartMutation,
  useClearCartMutation,
} = cartApi;
