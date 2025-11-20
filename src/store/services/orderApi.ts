import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./baseQuery";
import { QueryParams, toQueryString } from "./fn";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: createBaseQuery("/order"),
  tagTypes: ["Orders", "Returns", "Reviews"],
  endpoints: (builder) => ({
    // ✅ Get paginated + searchable order list
    getOrders: builder.query<{ data: any[]; total: number }, QueryParams>({
      query: (params) => {
        const query = toQueryString(params);
        return { url: `/list?${query}`, method: "GET" };
      },
      providesTags: ["Orders"],

      // identical caching behavior as productApi
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const {
          page,
          limit,
          searchTerm,
          columnFilters,
          numberRange,
          dateRange,
        } = queryArgs;
        return `${endpointName}-${page}-${limit}-${searchTerm}-${columnFilters}-${numberRange}-${dateRange}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || arg.page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        const mergedResults = [
          ...currentCache.data,
          ...newItems.data.filter((item) => !existingIds.has(item.id)),
        ];
        return { data: mergedResults, total: newItems.total };
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.limit !== previousArg?.limit ||
          currentArg?.searchTerm !== previousArg?.searchTerm ||
          currentArg?.columnFilters !== previousArg?.columnFilters ||
          currentArg?.dateRange !== previousArg?.dateRange ||
          currentArg?.numberRange !== previousArg?.numberRange
        );
      },
    }),

    // ✅ Get single order detail
    getOrder: builder.query<any, string | number>({
      query: (id) => `/read/${id}`,
      providesTags: ["Orders"],
    }),

    // ✅ Cancel order
    cancelOrder: builder.mutation<any, number>({
      query: (orderId) => ({
        url: `/${orderId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ["Orders"],
    }),

    // ✅ Create return request
    createReturn: builder.mutation<any, any>({
      query: (returnData) => ({
        url: '/returns/request',
        method: 'POST',
        body: returnData,
      }),
      invalidatesTags: ["Orders", "Returns"],
    }),

    // ✅ Create review
    createReview: builder.mutation<any, any>({
      query: (reviewData) => ({
        url: '/review/create',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ["Orders", "Reviews"],
    }),

    // ✅ Check cancellation eligibility
    checkCancellationEligibility: builder.query<any, number>({
      query: (orderId) => `/${orderId}/cancellation-eligibility`,
      providesTags: ["Orders"],
    }),

    // ✅ Get return requests
    getReturnRequests: builder.query<any, QueryParams>({
      query: (params) => {
        const query = toQueryString(params);
        return { url: `/returns/my-returns?${query}`, method: "GET" };
      },
      providesTags: ["Returns"],
    }),
  }),
});

export const { 
  useGetOrdersQuery, 
  useGetOrderQuery,
  useCancelOrderMutation,
  useCreateReturnMutation,
  useCreateReviewMutation,
  useCheckCancellationEligibilityQuery,
  useGetReturnRequestsQuery
} = orderApi;