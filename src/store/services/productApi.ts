// src/redux/services/productApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createPublicBaseQuery } from "./baseQuery";
import { toQueryString } from "./fn";

export type ProductQueryParams = {
  page?: number; // current page number (1-based)
  limit?: number; // number of items to return per page
  searchTerm?: string; // keyword search
  columnFilters?: [string, string | number | boolean][]; // e.g. [["name","car"],["description","product"]]
  numberRange?: [string, number, number]; // e.g. ["amount", 0, 1000]
  dateRange?: [string, string, string]; // e.g. ["created_at","01-01-2025","01-12-2025"]
  sort?: [string, "asc" | "desc"];
  level?: string; // "2" for level 2 categories (related products)
};

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: createPublicBaseQuery(""),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      { data: any[]; total: number },
      ProductQueryParams
    >({
      query: (params) => {
        // ✅ Check if this is a level 2 category (related products)
        if (params.level === "2" && params.columnFilters) {
          // Extract category ID from columnFilters [["category.id", 22]]
          const categoryIdFilter = params.columnFilters.find(
            (filter) => filter[0] === "category.id"
          );

          if (categoryIdFilter && categoryIdFilter[1]) {
            const categoryId = categoryIdFilter[1];
            const query = toQueryString({
              ...params,
              columnFilters: undefined, // Remove columnFilters for related endpoint
              level: undefined, // Remove level from query string
            });
            return {
              url: `/product/products/related/${categoryId}?${query}`,
              method: "GET"
            };
          }
        }

        // Default: use regular product list endpoint
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
          sort = null,
          level = null, // ✅ Include level
        } = queryArgs;

        return `${endpointName}-${page}-${limit}-${searchTerm}-${columnFilters}-${numberRange}-${dateRange}-${sort}-${level}`;
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
          currentArg?.sort !== previousArg?.sort ||
          currentArg?.level !== previousArg?.level // ✅ Include level
        );
      },
    }),
  }),
});

export const { useGetProductsQuery } = productApi;
