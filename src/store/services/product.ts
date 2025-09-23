import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://fakestoreapi.com/" }),
  endpoints: (builder) => ({
    getProducts: builder.query<any[], void>({
      query: () => "products",
    }),
  }),
});

// Export hooks for usage in components
export const { useGetProductsQuery } = productApi;
