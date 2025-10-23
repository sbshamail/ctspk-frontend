import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";
import { QueryParams, toQueryString } from "./fn";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/order`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.data?.access_token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Orders"],
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
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery } = orderApi;
