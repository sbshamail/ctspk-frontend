import { CartItemType } from "@/utils/modelTypes";
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: createBaseQuery("/cart"),
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
      invalidatesTags: ["Cart"], // ✅ ensures refetch consistency
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled;
          const newItem = res?.data;
          if (!newItem) return;
          // ✅ Optimistic cache patch
          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex(
                (i: CartItemType) => i.product.id === newItem.product.id
              );
              if (idx >= 0) draft[idx] = newItem;
              else draft.push(newItem);
            })
          );
        } catch (err) {
          console.warn("Add cart patch failed:", err);
        }
      },
    }),
    // not required for cart
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
    //           (i: CartItemType) =>
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

    // ---------- REMOVE ONE ----------
    removeCart: builder.mutation({
      query: (product_id) => ({
        url: `/delete/${product_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"], // ✅ refetch safety
      async onQueryStarted(product_id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const idx = draft.findIndex(
              (i: CartItemType) => i.product.id === product_id
            );
            if (idx >= 0) draft.splice(idx, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // ---------- REMOVE SELECTED ----------
    removeSelectedCart: builder.mutation({
      query: (product_ids: number[]) => ({
        url: `/delete-many`,
        method: "DELETE",
        body: { product_ids },
      }),
      invalidatesTags: ["Cart"],
      async onQueryStarted(product_ids, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!Array.isArray(draft)) return;
            const remaining = draft.filter(
              (i) => !product_ids.includes(i.product.id)
            );
            draft.splice(0, draft.length, ...remaining);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // ---------- CLEAR ----------
    clearCart: builder.mutation({
      query: () => ({
        url: `/delete-all`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (Array.isArray(draft)) draft.length = 0;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveCartMutation,
  useRemoveSelectedCartMutation,
  useClearCartMutation,
} = cartApi;
