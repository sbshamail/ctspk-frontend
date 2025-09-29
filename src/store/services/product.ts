// src/redux/services/productApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export const toQueryString = (params = {}) => {
  const query = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as any)}`
    )
    .join("&");

  return query;
};
export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`,
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      { data: any[]; total: number },
      {
        page: number;
        limit: number;
        // searchTerm?: string;
        // categories?: string[];
      }
    >({
      query: (params) => {
        const query = toQueryString(params);
        return {
          url: `/product/list?${query}`,
          method: "GET",
        };
      },

      // Cache key ignores page, but resets on filters
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${JSON.stringify({
          // categories: queryArgs.categories,
          // searchTerm: queryArgs.searchTerm,
        })}`;
      },

      // Merge pages
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache) return newItems;

        if (arg.page === 1) {
          // reset list if page=1 (fresh query)
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
        return currentArg?.page !== previousArg?.page;
      },
    }),
  }),
});

export const { useGetProductsQuery } = productApi;
