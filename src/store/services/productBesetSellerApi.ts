// src/redux/services/productApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";
import { toQueryString } from "./fn";

export type ProductQueryParams = {
  page?: number; // current page number (1-based)
  limit?: number; // number of items to return per page
  searchTerm?: string; // keyword search
  columnFilters?: [string, string | number | boolean][]; // e.g. [["name","car"],["description","product"]]
  numberRange?: [string, number, number]; // e.g. ["amount", 0, 1000]
  dateRange?: [string, string, string]; // e.g. ["created_at","01-01-2025","01-12-2025"]
  sort?: [string, "asc" | "desc"];
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
      ProductQueryParams
    >({
      query: (params) => {
        const query = toQueryString(params);
        return { url: `/product/best-sellers?days=20&${query}`, method: "GET" };
      },

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const {
          page,
          limit,
          searchTerm = null,
          columnFilters = null,
          numberRange = null,
          dateRange = null,
          sort = null, // 👈 include sort
        } = queryArgs;

        return `${endpointName}-${page}-${limit}-${searchTerm}-${columnFilters}-${numberRange}-${dateRange}-${sort}`;
      },

      merge: (currentCache, newItems, { arg }) => {
        // Replace cache on first page OR when filters change

        if (!currentCache || arg.page === 1) {
          return newItems;
        }

        // Infinite scroll merge
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
          currentArg?.numberRange !== previousArg?.numberRange ||
          currentArg?.sort !== previousArg?.sort
        );
      },
    }),
  }),
});

export const { useGetProductsQuery } = productApi;
