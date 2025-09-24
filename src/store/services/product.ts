import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://69.10.53.162/api/product/list",
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<any[], void>({
      query: () => ``,
    }),
  }),
});

// Export hooks for usage in components
export const { useGetProductsQuery } = productApi;
