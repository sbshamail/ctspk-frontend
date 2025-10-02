// src/redux/services/productApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../../config";

export type ProductQueryParams = {
  page?: number; // current page number (1-based)
  limit?: number; // number of items to return per page
  searchTerm?: string; // keyword search

  columnFilters?: [string, string | number | boolean][]; // e.g. [["name","car"],["description","product"]]
  numberRange?: [string, number, number]; // e.g. ["amount", 0, 1000]
  dateRange?: [string, string, string]; // e.g. ["created_at","01-01-2025","01-12-2025"]
};

export const toQueryString = (params: Record<string, any> = {}) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      let v = value;

      // If array or object, stringify
      if (Array.isArray(value) || typeof value === "object") {
        // Custom replacer: convert JS booleans to Python booleans
        v = JSON.stringify(value, (_k, val) => {
          if (val === true) return "True";
          if (val === false) return "False";
          return val;
        });
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`;
    })
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
      ProductQueryParams
    >({
      query: (params) => {
        const query = toQueryString(params);
        return { url: `/product/list?${query}`, method: "GET" };
      },

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const {
          page,
          limit,
          searchTerm = null,
          columnFilters = null,
          numberRange = null,
          dateRange = null,
        } = queryArgs;

        return `${endpointName}-${page}-${limit}-${searchTerm}-${columnFilters}-${numberRange}-${dateRange}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache || arg.page === 1) {
          return newItems;
        }

        // Prevent duplicate merges
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
  }),
});

export const { useGetProductsQuery } = productApi;
