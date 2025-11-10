import { WishlistItemType } from "@/utils/modelTypes"; // create if needed
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export interface WishlistQueryParams {
  page: number;
  limit: number;
  searchTerm?: string | null;
  columnFilters?: string | null;
  numberRange?: string | null;
  dateRange?: string | null;
  sort?: string | null;
}

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/wishlist`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.data?.access_token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Wishlist"],

  endpoints: (builder) => ({
    // ---------- GET WISHLIST (returns data + total) ----------
    getWishlist: builder.query<
      { data: WishlistItemType[]; total: number },
      void
    >({
      query: () => "/my-wishlist",
      providesTags: ["Wishlist"],
      transformResponse: (res: any) => {
        return res;
      },
    }),

    // ---------- ADD TO WISHLIST ----------
    addToWishlist: builder.mutation({
      query: (body: {
        product_id: number;
        variation_option_id?: number | null;
      }) => ({
        url: "/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Optimistic cache patch
          const patch = dispatch(
            wishlistApi.util.updateQueryData(
              "getWishlist",
              undefined,
              (draft) => {
                if (!Array.isArray(draft)) return;
                const exists = draft.some(
                  (i: any) =>
                    i.product_id === arg.product_id &&
                    i.variation_option_id === arg.variation_option_id
                );
                if (!exists) draft.push(arg as any);
              }
            )
          );
          await queryFulfilled;
        } catch (err) {
          console.warn("Add to wishlist patch failed:", err);
        }
      },
    }),

    // ---------- REMOVE FROM WISHLIST ----------
    removeFromWishlist: builder.mutation({
      query: ({ id }) => ({
        url: `/remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              if (!Array.isArray(draft)) return;
              const idx = draft.findIndex(
                (i: any) =>
                  i.product_id === arg.product_id &&
                  i.variation_option_id === arg.variation_option_id
              );
              if (idx >= 0) draft.splice(idx, 1);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch (err) {
          patch.undo();
          console.warn("Remove from wishlist patch failed:", err);
        }
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
